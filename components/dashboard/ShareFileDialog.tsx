import React, { useState } from 'react';
import { X, Check, Copy, Share2 } from 'lucide-react';
import { KeyPair } from '@/lib/crypto';
import { FileMetaData } from './FileItem';
import { getDecryptedFileBlob, encryptFiles } from '@/lib/fileUtils';
import { useSession } from 'next-auth/react';

interface ShareFileDialogProps {
  file: FileMetaData;
  keyPair: KeyPair | null;
  isOpen: boolean;
  onClose: () => void;
}

const ShareFileDialog: React.FC<ShareFileDialogProps> = ({ file, keyPair, isOpen, onClose }) => {
  const { data: session } = useSession();
  const [recipient, setRecipient] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successLink, setSuccessLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessLink(null);
    setCopied(false);

    if (!recipient.trim()) {
      setError('Please enter a recipient username or email.');
      return;
    }

    if (!keyPair?.privateKey) {
      setError('Missing private key to decrypt your file.');
      return;
    }

    setIsSharing(true);
    try {
      // 1. Fetch recipient's public key
      const pubKeyRes = await fetch(`/api/users/public-key?username=${encodeURIComponent(recipient)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const pubKeyData = await pubKeyRes.json();
      if (!pubKeyRes.ok) {
        throw new Error(pubKeyData.error || 'Failed to fetch recipient public key.');
      }
      const receiverPublicKey = pubKeyData.publicKey;

      // 2. Decrypt the file
      const blob = await getDecryptedFileBlob(file.id.toString(), keyPair);
      const originalFile = new File([blob], file.name, { type: file.type });

      // 3. Encrypt the file for the receiver
      const dummyKeyPair = { publicKey: receiverPublicKey, privateKey: '' as any };
      const encryptedResult = await encryptFiles([originalFile], dummyKeyPair);
      
      if (!encryptedResult || encryptedResult.length === 0) {
        throw new Error('Failed to encrypt file for the recipient.');
      }
      
      const encryptedData = encryptedResult[0];

      // 4. Send to /api/share
      const sender = session?.user?.email || session?.user?.name || 'Unknown Sender';
      
      const formData = new FormData();
      formData.append('recipientUsername', recipient);
      formData.append('senderUsername', sender);
      formData.append('file', new Blob([encryptedData.file]));
      formData.append('encryptedAesKey', new Blob([encryptedData.encryptedKey]));
      formData.append('iv', new Blob([encryptedData.iv]));
      formData.append('fileName', file.name);
      formData.append('fileType', file.type);

      const shareRes = await fetch('/api/share', {
        method: 'POST',
        body: formData
      });

      const shareData = await shareRes.json();
      if (!shareRes.ok) {
        throw new Error(shareData.message || 'Failed to share file.');
      }

      setSuccessLink(shareData.downloadUrl);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = () => {
    if (successLink) {
      navigator.clipboard.writeText(successLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 100 }}>
      <div className="modal-content max-w-md animate-scale-in">
        <div className="flex justify-between items-center p-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary-light" />
            Share File
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-primary/10 rounded-lg text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-text-secondary mb-4">
            Share <span className="font-medium text-text-primary">{file.name}</span> securely. The file will be encrypted using the recipient&apos;s public key.
          </p>

          {!successLink ? (
            <form onSubmit={handleShare} className="flex flex-col gap-4">
              <div>
                <label htmlFor="recipient" className="block text-xs font-medium text-text-secondary mb-1.5">
                  Recipient Username or Email
                </label>
                <input
                  id="recipient"
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. alice@example.com"
                  className="input-field"
                  disabled={isSharing}
                  autoComplete="off"
                />
              </div>

              {error && <p className="text-danger text-xs">{error}</p>}

              <button
                type="submit"
                disabled={isSharing || !recipient.trim()}
                className="btn btn-primary w-full mt-1"
              >
                {isSharing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Encrypting & Sharing...
                  </>
                ) : (
                  'Share Securely'
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-lg flex items-start gap-2" style={{ background: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-success text-sm">File shared successfully!</p>
                  <p className="text-success/70 text-xs mt-1">This link will expire in 3 days.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={successLink}
                    className="input-field text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="btn btn-secondary btn-sm shrink-0"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="btn btn-secondary w-full mt-1"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareFileDialog;
