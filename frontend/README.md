# TrafficIQ frontend

The frontend is a JavaScript/JSX React application built with Vite. It uses React Router, Tailwind CSS, Axios, Recharts, Socket.IO Client, and Lucide React.

```powershell
npm install
npm run dev
```

Set `VITE_API_BASE_URL` when the backend is hosted separately; it defaults to `/api`. Set `VITE_SOCKET_URL` only when Socket.IO is hosted on a different origin. The Vite development server proxies API and Socket.IO requests to `http://localhost:4000`.
