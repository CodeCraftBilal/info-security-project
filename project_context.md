# 1. Project Overview
SecureShare is a modern, end-to-end encrypted file sharing web application designed to protect sensitive data. It leverages military-grade encryption in the browser (using the Web Crypto API) before uploading, ensuring only authorized users and intended recipients can access the files.

# 2. Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend:** Next.js Route Handlers & Server Actions
- **Language:** TypeScript
- **Database & ORM:** MongoDB (Native Driver)
- **Key Infrastructure/Tools:** Cloudinary (File Storage), Web Crypto API (AES-256-GCM, RSA-OAEP for encryption), `jose` (JWT Session Management), `bcrypt` (Password Hashing)

# 3. Folder Structure
```text
/
├── app/               # Next.js App Router pages (routing, layouts, and API routes)
│   ├── api/           # API routes for dynamic data operations (fetching/deleting)
│   ├── dashboard/     # Protected user dashboard view
│   ├── login/         # Authentication (login) view
│   ├── register/      # Authentication (registration) view
│   └── share/         # File sharing view
├── Action/            # Next.js Server Actions for secure backend operations (upload, auth)
├── components/        # Reusable React components (UI elements)
├── lib/               # Utility functions, MongoDB client setup, and cryptography services
└── public/            # Static public assets
```

# 4. Core Architecture & Patterns
- **Architecture:** Next.js App Router paradigm utilizing both Server Components and Client Components. It uses a custom middleware (`proxy.ts`) to validate JWT sessions for protected routes. Backend logic is heavily reliant on Next.js Server Actions for secure mutations (like file uploads and database writes).
- **State Management:** Native React state management (`useState`, `useEffect`, `useRef`) within Client Components. No external global state manager (like Redux or Zustand) is used.
- **Data Fetching:** Standard native `fetch` combined with Next.js App Router caching mechanisms, Server Actions for mutations, and Route Handlers for specific API endpoints.

# 5. Key Coding Conventions
- **Client/Server Boundary:** Strict separation of client-side logic (e.g., Web Crypto API operations requiring the browser environment, marked with `"use client"`) and server-side logic (database calls, Cloudinary uploads).
- **Security First:** Cryptographic keys (RSA) are managed locally via IndexedDB on the client. Sensitive operations like encryption and decryption happen strictly in the browser.
- **Styling & UI:** Functional components with hooks are exclusively used. Tailwind CSS is utilized for styling alongside Lucide React for iconography.

# 6. Environment Setup
**Required `.env.local` Variables:**
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `MONGODB_URI`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

**Core Commands:**
- **Install dependencies:** `npm install`
- **Run development server:** `npm run dev`
- **Build for production:** `npm run build`
