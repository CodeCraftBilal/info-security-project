# SecureShare 🔒

**SecureShare** is a modern, end-to-end encrypted file sharing web application designed to protect your sensitive data. By leveraging military-grade encryption right in the browser, SecureShare ensures that only you and your intended recipients can access your files.

## Features ✨

- **End-to-End Encryption (E2EE)**: Files are encrypted locally on your device using the Web Crypto API (AES-GCM for file data, RSA-OAEP for secure key exchange) before they are ever uploaded to the cloud. 
- **Secure File Storage**: Encrypted raw file data is stored reliably using Cloudinary, while the encrypted keys and metadata are safely stored in MongoDB.
- **Authentication & Authorization**: Secure user login managed by **Auth.js (NextAuth v5)** supporting OAuth (Google, GitHub) and Magic Links (Resend).
- **Secure File Sharing & Notifications**: Generate secure shares for specific users, with real-time in-app notifications for the recipients.
- **Modern UI & Framework**: Built with **Next.js 16** (App Router), React 19, and beautifully styled with Tailwind CSS v4.
- **Client-Side Key Management**: Cryptographic keys are managed completely locally using the browser's IndexedDB, ensuring private keys never leave the client.

## Tech Stack 🛠️

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React
- **Backend**: Next.js Route Handlers & Server Actions
- **Database**: MongoDB (Native Driver) with `@auth/mongodb-adapter`
- **File Storage**: Cloudinary
- **Security & Cryptography**: 
  - Web Crypto API (AES-256-GCM, RSA-OAEP)
  - Auth.js / NextAuth v5 for session and identity management

## How Encryption Works 🛡️

1. **Key Generation**: When a user registers/logs in for the first time, an RSA Key Pair is generated in the browser and stored in IndexedDB. Only the public key is sent to the server.
2. **File Encryption**: When uploading a file, a unique AES-GCM symmetric key is generated. The file is encrypted in the browser using this AES key.
3. **Key Exchange**: The symmetric AES key is then encrypted using an RSA Public Key (your own for personal files, or the recipient's for shared files).
4. **Upload**: The encrypted file is sent to Cloudinary, and the encrypted AES key, Initialization Vector (IV), and metadata are sent to the MongoDB database via Next.js Server Actions.
5. **Decryption**: Upon retrieval, the encrypted AES key is decrypted using the user's local RSA Private Key, which is then used to decrypt the actual file in the browser.

## Getting Started 🚀

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Cluster (or local instance)
- Cloudinary Account
- Resend Account (for magic links)
- Google/GitHub OAuth apps (optional but recommended)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd info-security-project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root directory and add the following variables:
   ```env
   # NextAuth / Auth.js
   AUTH_SECRET=your_auth_secret
   AUTH_URL=http://localhost:3000
   
   # OAuth Providers
   GOOGLE_CLIENT_ID=your_google_id
   GOOGLE_CLIENT_SECRET=your_google_secret
   GITHUB_CLIENT_ID=your_github_id
   GITHUB_CLIENT_SECRET=your_github_secret

   # Email (Resend)
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=onboarding@resend.dev

   # MongoDB
   MONGODB_URI=your_mongodb_connection_string

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # App Config
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure 📁

- `/app`: Next.js 16 App Router pages (Dashboard, Share) and API Route Handlers.
- `/components`: Reusable React components (Header, Features, SecurityBadges, SharedFIles, etc.).
- `/lib`: Utility functions, MongoDB client setup, and cryptography services (`crypto.ts`, `keyManagement.ts`, `fileUtils.ts`).
- `/Action`: Next.js Server Actions for secure backend operations like saving file metadata.
- `/context`: Global React contexts (e.g., real-time notifications).
- `/hooks`: Custom React hooks for functionality like local key pair management.

## License 📄
This project is licensed under the MIT License.
