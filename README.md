# DexChat
## Project Overview
DexChat is a full-stack, real-time team chat application built with Convex and Chef, designed to replicate the core experience of Slack. It offers seamless authentication, persistent message storage, and dynamic channel support — all powered by Convex’s serverless backend and Vite-powered frontend.

🔧 Features:
- 🔐 Anonymous authentication (Convex Auth)
- 💬 Real-time messaging across multiple channels
- 🧑‍💼 User profiles and persistent sessions
- ⚙️ Fully reactive frontend built with Vite + React
- ☁️ Serverless backend with Convex (no need to manage your own DB)
- 📁 Organized structure for scalable feature expansion
  
## Project structure
  
The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.
