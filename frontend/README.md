# TrafficIQ frontend

The frontend is a JavaScript/JSX React application built with Vite. It uses React Router, Tailwind CSS, Axios, Recharts, Socket.IO Client, and Lucide React.

```powershell
npm install
npm run dev
```

In development, API requests default to `/api` and the Vite server proxies API and Socket.IO requests to `http://localhost:4000`. Production builds default to the deployed backend at `https://vehant-tech.onrender.com`; override these build-time values with `VITE_API_BASE_URL` (include the `/api` path) or `VITE_SOCKET_URL` if your backend uses a different URL.

On Render, set `CLIENT_ORIGIN` to the exact deployed Vercel origin (for example, `https://your-app.vercel.app`). Comma-separate origins to allow additional Vercel deployment domains. Re-deploy the backend after changing this setting.
