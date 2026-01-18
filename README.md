<div align="center">

# 🎯 Student Quiz Application

**Modern quiz platform with real-time scoring, AI-powered certificates, and WebSocket integration**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.17-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [WebSocket](#-websocket-integration) • [Deployment](#-deployment)

</div>

---

## 🚀 Quick Start

```bash
# Clone and navigate
git clone <repository-url>
cd quiz-app

# Install dependencies
npm run install-all

# Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with your credentials

# Start development servers
npm run dev
```

**Access:** Frontend: http://localhost:5173 • Backend: http://localhost:3000

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📝 Quiz System
- Multi-part quiz support (A, B, C...)
- Round-based organization
- Randomized questions & options
- Timer with visual warnings
- Smooth navigation & progress tracking
- Rich text with emoji & formulas

</td>
<td width="50%">

### 🔒 Security
- DevTools detection & blocking
- Tab switch monitoring
- Context menu disabled
- Copy/paste prevention
- Auto-redirect on violations
- Daily attempt limits (3/day)

</td>
</tr>
<tr>
<td>

### 🎓 Results & Certificates
- Real-time scoring
- PDF certificate generation
- Email delivery via Brevo
- Performance analytics
- Round timing breakdown

</td>
<td>

### 🔄 Real-Time WebSocket
- Live attempt tracking
- Score updates to admin
- Instant deletion notifications
- Quiz publish/update alerts
- No refresh required

</td>
</tr>
</table>

---

## 🏗️ Tech Stack

**Frontend** • React 18.3 • Vite 5.4 • React Router 7.1 • TailwindCSS 3.4 • SweetAlert2 • Lucide Icons • Socket.IO Client

**Backend** • Node.js 18+ • Express 5.1 • MongoDB 8.17 • Mongoose • Socket.IO 4.8 • Brevo Email • Puppeteer (PDF)

---

## 🔄 WebSocket Integration

Real-time bidirectional communication with admin dashboard via Socket.IO.

**User → Admin**
```javascript
// Auto-emitted events
✓ user:joined          // New registration
✓ user:attemptStarted  // Quiz started
✓ user:scoreUpdated    // Quiz completed
```

**Admin → User**
```javascript
// Auto-received events
✓ user:update          // Deletion, quiz changes
✓ user:deleted         // Specific user deleted
```

**Configuration**
```env
# frontend/.env
VITE_ADMIN_SOCKET_URL=http://localhost:8000
```

See [WEBSOCKET_DATA_FLOWS.md](../WEBSOCKET_DATA_FLOWS.md) for complete documentation.

---

## ⚙️ Configuration

### Backend Environment (.env)

```env
# Email Service (Brevo)
BREVO_API_KEY=xkeysib-your_api_key_here
SMTP_USER=your_verified@email.com

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/Quiz

# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173

# WebSocket
ADMIN_SOCKET_URL=http://localhost:8000
```

### Frontend Environment (.env)

```env
# WebSocket Connection
VITE_ADMIN_SOCKET_URL=http://localhost:8000
```

**Get Brevo API Key:** https://www.brevo.com → Settings → SMTP & API → Generate Key (Free: 300 emails/day)

**Get MongoDB URI:** https://cloud.mongodb.com → Create M0 Cluster (Free: 512MB) → Connect

---

## 📦 Installation

### Prerequisites
- Node.js 18+ & npm 9+
- MongoDB Atlas account
- Brevo account

### Setup Steps

```bash
# 1. Install dependencies
npm run install-all

# 2. Create environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Configure credentials in .env files
# Add BREVO_API_KEY, MONGO_URI, etc.

# 4. Start development
npm run dev
```

### Available Scripts

```bash
npm run dev              # Start both frontend & backend
npm run frontend         # Frontend only (port 5173)
npm run backend          # Backend only (port 3000)
npm run install-all      # Install all dependencies
npm run build            # Build for production
```

---

## 🚀 Deployment

**Render.com** (Recommended for full-stack)

1. Create Web Service for backend
2. Create Static Site for frontend
3. Set environment variables
4. Connect MongoDB Atlas
5. Configure CORS with production URLs

See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed instructions.

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port already in use** | Kill process: `npx kill-port 3000 5173` |
| **CORS errors** | Verify `FRONTEND_URL` in backend .env |
| **Email not sending** | Check Brevo API key & sender email |
| **MongoDB connection fails** | Whitelist IP (0.0.0.0/0) in Atlas |
| **WebSocket disconnects** | Verify `ADMIN_SOCKET_URL` is correct |
| **Certificate generation fails** | Install Puppeteer dependencies |

---

## 📄 License

MIT © 2026

---

<div align="center">

**Built with ❤️ using React, Node.js, MongoDB, and Socket.IO**

[Report Bug](../../issues) • [Request Feature](../../issues)

</div>
