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
      const pubKeyRes = await fetch('/api/users/publick-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: recipient })
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-500" />
            Share File
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Share <span className="font-medium text-gray-800">{file.name}</span> securely. The file will be encrypted using the recipient's public key.
          </p>

          {!successLink ? (
            <form onSubmit={handleShare} className="flex flex-col gap-4">
              <div>
                <label htmlFor="recipient" className="block text-xs font-medium text-gray-700 mb-1">
                  Recipient Username or Email
                </label>
                <input
                  id="recipient"
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. alice@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  disabled={isSharing}
                  autoComplete="off"
                />
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={isSharing || !recipient.trim()}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
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
              <div className="bg-green-50 border border-green-100 text-green-800 text-sm p-3 rounded-lg flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">File shared successfully!</p>
                  <p className="text-green-700/80 mt-1">This link will expire in 3 days.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={successLink}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm text-gray-600"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors text-gray-700"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
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
