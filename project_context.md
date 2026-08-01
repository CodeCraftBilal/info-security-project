# 1. Project Overview
- **Purpose:** SecureShare is a modern, end-to-end encrypted file sharing web application designed to protect sensitive data.
- **Main Features:** Secure file upload, targeted file sharing between users, client-side encryption, and real-time notifications for shared files.
- **Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript, MongoDB (Native Driver), Cloudinary, Auth.js / NextAuth v5.

# 2. Folder Structure
- `app/`: Next.js App Router pages (routing, layouts) and Route Handlers (`app/api/`).
- `Action/`: Next.js Server Actions for secure backend operations (e.g., saving metadata).
- `components/`: Reusable React UI components (`Header`, `SharedFIles`, etc.).
- `context/`: React context providers for global state (e.g., `NotificationContext`).
- `hooks/`: Custom React hooks (e.g., `useKeyPair.tsx`, `useClickOutside.ts`).
- `lib/`: Utility functions, MongoDB client setup, and cryptography services.
- `lib/models/`: TypeScript interfaces for database documents (e.g., `User.ts`).
- `public/`: Static public assets.

# 3. Important Files
| File Path | Purpose | Key Details |
| --- | --- | --- |
| `auth.ts` / `auth.config.ts` | Authentication Configuration | Configures Auth.js with Google, GitHub, and Resend. Manages JWT/Session callbacks to verify `publicKey` presence. |
| `lib/crypto.ts` | Cryptography Service | Web Crypto API wrapper. Handles AES-GCM (file encryption), RSA-OAEP (key wrapping), and mnemonic generation. |
| `lib/keyManagement.ts` | Local Key Storage | Manages RSA key pairs in the browser's IndexedDB (`KeyStore`). |
| `lib/fileUtils.ts` | File Utilities | Handles file encryption, decryption, downloading, and API interactions for files. |
| `lib/mongodb.ts` | Database Client | Singleton MongoDB client configuration. |
| `Action/saveSharedFileMetadataAction.ts` | Server Action | Saves metadata for shared files to MongoDB and creates notifications for recipients. |
| `app/api/share/route.ts` | API Route | Handles direct uploads of encrypted files to Cloudinary and saves metadata via MongoDB. |
| `context/NotificationContext.tsx` | Global State | Provides real-time notification state across the app. |

# 4. Architecture
- **Overall:** Next.js App Router utilizing Server Components for performance and Client Components for browser-specific APIs (Web Crypto, IndexedDB).
- **Authentication Flow:** Auth.js handles login. Post-login, the dashboard checks for a user's `publicKey`. If missing, a new RSA keypair is generated, stored in IndexedDB, and the public key is synced to the server.
- **Data Flow:** Files are AES-encrypted on the client. The AES key is RSA-encrypted using the recipient's public key (for sharing). The encrypted file goes to Cloudinary; the encrypted key and metadata go to MongoDB.
- **State Management:** React State/Context (`NotificationContext`), NextAuth Session for user state, and IndexedDB for persistent local cryptographic key storage.
- **API Structure:** Hybrid approach using both Next.js Route Handlers (`app/api/`) and Server Actions (`Action/`) for mutations.
- **Routing:** Protected routes (`/dashboard`, `/share`) managed via Next.js middleware and layouts.

# 5. Database
- **Collections:**
  - `users`: Managed by NextAuth. Contains OAuth details and `publicKey`.
  - `files`: Personal uploaded files metadata.
  - `sharedFiles`: Files shared between users (maps `senderUsername` to `recipientUsername`).
  - `notifications`: Alerts for users (e.g., when a file is shared).
- **Relationships:** `sharedFiles` and `notifications` are linked to users via their usernames.

# 6. Environment Variables
- `AUTH_SECRET`: NextAuth/Auth.js session encryption secret.
- `AUTH_URL`: NextAuth base URL.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Google OAuth credentials.
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: GitHub OAuth credentials.
- `RESEND_API_KEY`: API key for magic link emails.
- `EMAIL_FROM`: Sender email address for Auth.js.
- `MONGODB_URI`: MongoDB connection string.
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`: Cloudinary storage credentials.
- `NEXT_PUBLIC_BASE_URL`: Base URL used for generating share links.

# 7. External Services
- **MongoDB:** Primary database.
- **Auth.js (NextAuth):** Authentication provider.
- **Cloudinary:** Cloud storage for storing the encrypted file blobs.
- **Resend:** Transactional email service for Magic Links.
- **Web Crypto API:** Browser native API for all cryptographic operations.

# 8. Features
- [x] OAuth and Magic Link Authentication
- [x] Client-side End-to-End Encryption (E2E)
- [x] File uploading and Cloudinary integration
- [x] Secure file sharing between users
- [x] In-app notifications for shared files
- [x] Persistent local key management via IndexedDB

# 9. Pending Work
- **TODO:** Verify if private key recovery via mnemonic phrase is fully integrated into the UI.
- **TODO:** Verify the complete deletion flow (ensure Cloudinary assets are deleted when MongoDB metadata is removed).
- **TODO:** Verify functionality of `app/api/upload/signature/route.ts` if direct-to-Cloudinary uploads are planned.

# 10. Development Notes
- **Client/Server Boundary:** Strict separation is enforced. Cryptographic operations (encryption/decryption) MUST happen in the browser (`"use client"`).
- **Security Rule:** Private keys are NEVER sent to the server. They remain securely in the browser's IndexedDB.
- **Key Wrapping:** AES keys used for file encryption are wrapped (encrypted) using RSA-OAEP public keys before being stored in the database.
