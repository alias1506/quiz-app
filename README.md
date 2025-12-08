# 🎯 Quiz Application - Student Portal

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green.svg)

**A modern, secure, and feature-rich quiz application built with React and Node.js**

[Live Demo](https://quiz-app-wpgi.onrender.com) • [Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## 🎓 Overview

The Quiz Application is a comprehensive online examination platform designed for students to take quizzes and earn certificates. Built with modern web technologies, it offers a seamless user experience with real-time validation, certificate generation, and advanced security features to ensure fair assessments.

### Key Highlights

- 🔐 **Secure Authentication** - Session-based authentication with password validation
- 📝 **Interactive Quizzes** - Dynamic question loading from active question sets
- 🏆 **Certificate Generation** - Automatic PDF certificate generation for qualified students
- 🛡️ **Anti-Cheating Measures** - DevTools detection and tab switch monitoring
- 📱 **Responsive Design** - Optimized for desktop and mobile devices
- 🎨 **Modern UI/UX** - Clean, intuitive interface built with React

---

## ✨ Features

### User Features

#### Authentication & Registration
- ✅ User registration with email validation
- ✅ Secure login with encrypted passwords
- ✅ Session management with automatic timeout
- ✅ User-friendly error messages

#### Quiz Taking
- ✅ Dynamic question loading from active sets
- ✅ Multiple-choice questions with 4 options
- ✅ Real-time answer validation
- ✅ Progress tracking throughout the quiz
- ✅ Automatic submission on time limit (if implemented)

#### Certificate Generation
- ✅ Automatic PDF certificate creation for passing students
- ✅ Personalized certificates with student name and score
- ✅ Download and email delivery options
- ✅ Professional certificate design

#### Security Features
- ✅ DevTools detection and warning system
- ✅ Tab switch monitoring and automatic submission
- ✅ Session-based authentication
- ✅ Protected routes with authentication guards
- ✅ Secure API endpoints

### Technical Features

- 📊 RESTful API architecture
- 🔄 Real-time data synchronization
- 💾 MongoDB database integration
- 📧 Email notifications with Nodemailer
- 📄 PDF generation with PDFKit
- 🎨 Modern React frontend with hooks
- 🔒 Secure backend with Express.js

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI framework for building interactive interfaces |
| **React Router** | ^6.x | Client-side routing and navigation |
| **Vite** | ^5.4.11 | Fast build tool and development server |
| **ESLint** | ^9.15.0 | Code linting and quality assurance |
| **SweetAlert2** | Latest | Beautiful, responsive alert dialogs |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | ≥16.0.0 | JavaScript runtime environment |
| **Express** | 5.1.0 | Web application framework |
| **MongoDB** | 8.17.1 | NoSQL database for data storage |
| **Mongoose** | 8.17.1 | MongoDB object modeling |
| **PDFKit** | 0.17.1 | PDF document generation |
| **Nodemailer** | 7.0.5 | Email sending functionality |
| **Axios** | 1.11.0 | HTTP client for API requests |
| **Validator** | 13.15.15 | String validation and sanitization |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Nodemon** | Automatic server restart during development |
| **Concurrently** | Run multiple commands concurrently |
| **dotenv** | Environment variable management |

---

## 🏗️ Architecture

```
quiz-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── Certificate.jsx          # Certificate display component
│   │   │   ├── DevToolsDetector.jsx     # Security component
│   │   │   ├── ProtectedRoute.jsx       # Route protection
│   │   │   ├── BlockIfLoggedIn.jsx      # Login page protection
│   │   │   └── ThankYouGuard.jsx        # Thank you page guard
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.jsx            # Main quiz dashboard
│   │   │   ├── Starting.jsx             # Login/Register page
│   │   │   ├── ThankYou.jsx             # Post-quiz page
│   │   │   └── NotFound.jsx             # 404 error page
│   │   ├── contexts/        # React contexts
│   │   │   └── SecurityContext.jsx      # Security monitoring context
│   │   ├── App.jsx          # Main App component
│   │   ├── main.jsx         # Application entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   ├── index.html           # HTML template
│   ├── vite.config.js       # Vite configuration
│   └── package.json         # Frontend dependencies
│
├── backend/                  # Node.js backend application
│   ├── routes/              # API route handlers
│   │   ├── authRoute.js                 # Authentication routes
│   │   ├── questionRoute.js             # Question management
│   │   ├── setsRoute.js                 # Quiz set management
│   │   └── certificateRoute.js          # Certificate generation
│   ├── models/              # Mongoose schemas
│   │   ├── authModel.js                 # User model
│   │   ├── questionModel.js             # Question model
│   │   └── setsModel.js                 # Quiz set model
│   ├── controllers/         # Business logic
│   │   └── certificateController.js     # Certificate logic
│   ├── server.js            # Server entry point
│   ├── .env                 # Environment variables
│   └── package.json         # Backend dependencies
│
├── package.json             # Root package file
└── README.md               # This file
```

---

## 🚀 Live Application

**Student Portal:** [https://quiz-app-wpgi.onrender.com](https://quiz-app-wpgi.onrender.com)

Access the live quiz application to:
- Register and take quizzes
- Earn certificates
- Track your progress

---

## 📦 Installation

### Prerequisites

- **Node.js** (v16.0.0 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

### Quick Start

#### 1. Clone the Repository

```bash
git clone https://github.com/alias1506/quiz-app.git
cd quiz-app
```

#### 2. Install Dependencies

```bash
# Install all dependencies
npm run install-all
```

#### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/Quiz

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

#### 4. Run the Application

```bash
# Development mode (both frontend and backend)
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | 5000 | No |
| `MONGO_URI` | MongoDB connection string | - | Yes |
| `EMAIL_HOST` | SMTP server host | smtp.gmail.com | Yes (for emails) |
| `EMAIL_PORT` | SMTP server port | 587 | Yes (for emails) |
| `EMAIL_USER` | Email account username | - | Yes (for emails) |
| `EMAIL_PASSWORD` | Email account password | - | Yes (for emails) |
| `NODE_ENV` | Environment (development/production) | development | No |
| `PASS_THRESHOLD` | Minimum passing score percentage | 50 | No |

### Email Setup

For certificate delivery via email:

1. Enable 2-Step Verification in your Google Account
2. Generate an App Password in Google Account Settings
3. Use the app password in `EMAIL_PASSWORD` variable

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow ESLint configuration
- Use meaningful variable and function names
- Add comments for complex logic
- Write unit tests for new features

### Commit Messages

```
feat: Add new feature
fix: Fix bug in feature
docs: Update documentation
style: Format code
refactor: Refactor code structure
test: Add tests
chore: Update dependencies
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---



## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the database solution
- Node.js community for excellent packages
- All contributors who have helped this project grow

---

## 📞 Support

For issues or questions, please open an issue in the repository.

---

## 🗺️ Roadmap

### Upcoming Features

- [ ] Timer functionality for quizzes
- [ ] Question shuffling for fairness
- [ ] Multiple quiz attempts
- [ ] Detailed score breakdown
- [ ] Student performance analytics
- [ ] Mobile app version
- [ ] Dark mode support
- [ ] Multi-language support

