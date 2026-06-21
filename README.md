# SecureShare 🔒

**SecureShare** is a modern, end-to-end encrypted file sharing web application designed to protect your sensitive data. By leveraging military-grade encryption right in the browser, SecureShare ensures that only you and your intended recipients can access your files.

## Features ✨

- **End-to-End Encryption (E2EE)**: Files are encrypted locally on your device using the Web Crypto API (AES-GCM for file data, RSA-OAEP for secure key exchange) before they are ever uploaded to the cloud. 
- **Secure File Storage**: Encrypted raw file data is stored reliably using Cloudinary, while the encrypted keys and metadata are safely stored in MongoDB.
- **Authentication & Authorization**: Secure user registration and login. Session management is handled via secure cookies and JSON Web Tokens (JWT) using `jose`, validated by a custom proxy middleware protecting private routes (`/dashboard`, `/share`).
- **File Management**: Comprehensive APIs to fetch, download, and delete encrypted files and shared files securely.
- **Modern UI & Framework**: Built with **Next.js 16** (App Router), React 19, and beautifully styled with Tailwind CSS.
- **Secure File Sharing**: Generate secure sharing links for your encrypted files, restricting access only to authorized recipients.

## Tech Stack 🛠️

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Lucide React
- **Backend**: Next.js Route Handlers & Server Actions
- **Database**: MongoDB (Native Driver)
- **File Storage**: Cloudinary
- **Security & Cryptography**: 
  - Web Crypto API (AES-256-GCM, RSA-OAEP)
  - `bcrypt` for password hashing
  - `jose` for lightweight JWT management and proxy session validation

## How Encryption Works 🛡️

1. **Key Generation**: When a user registers/logs in, an RSA Key Pair is generated.
2. **File Encryption**: When uploading a file, a unique AES-GCM symmetric key is generated. The file is encrypted in the browser using this AES key.
3. **Key Exchange**: The symmetric AES key is then encrypted using the user's RSA Public Key.
4. **Upload**: The encrypted file is sent to Cloudinary, and the encrypted AES key, Initialization Vector (IV), and metadata are sent to the MongoDB database via Next.js Server Actions.
5. **Decryption**: Upon retrieval via dynamic API routes (`/api/files/[id]`), the encrypted AES key is decrypted using the user's RSA Private Key, which is then used to decrypt the actual file in the browser.

## Getting Started 🚀

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Cluster (or local instance)
- Cloudinary Account

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
   # NextAuth / Session Secret
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000

   # MongoDB
   MONGODB_URI=your_mongodb_connection_string

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure 📁

- `/app`: Next.js 16 App Router pages (Dashboard, Login, Register, Share).
- `/app/api`: API Routes for fetching and deleting files (`/api/files/[id]`, `/api/downloadShared/[id]`).
- `/components`: Reusable React components (Header, Features, SecurityBadges, etc.).
- `/lib`: Utility functions, MongoDB client setup, and cryptography services (`crypto.ts`, `keyManagement.ts`).
- `/Action`: Next.js Server Actions for secure backend operations like file upload and user authentication.
- `proxy.ts`: Custom middleware proxy verifying JWT sessions for protected routes.

## License 📄
This project is licensed under the MIT License.
