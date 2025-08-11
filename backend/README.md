# Saral Vyapar POS - Backend API

A comprehensive backend API for the Saral Vyapar POS system, built with Node.js, Express, and SQLite.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Email verification system
  - Password reset functionality
  - Secure password hashing with bcrypt

- **Shop Management**
  - Create, read, update, and delete shops
  - One shop per user policy
  - Shop statistics and analytics

- **User Profile Management**
  - Complete user profiles
  - Profile updates and management
  - Account deletion with cascade

- **Email Services**
  - Welcome emails
  - Email verification
  - Password reset emails
  - Beautiful HTML email templates

- **Security Features**
  - Helmet.js for security headers
  - CORS configuration
  - Input validation and sanitization
  - Rate limiting ready

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT + bcryptjs
- **Email**: Nodemailer
- **Validation**: express-validator
- **Security**: Helmet, CORS
- **Logging**: Morgan

## 📋 Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- Gmail account (for email services)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password
```

### 3. Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_APP_PASSWORD`

### 4. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 🗄️ Database

The SQLite database is automatically created in the `data/` directory with the following tables:

- **users**: User accounts and authentication
- **shops**: Shop information and details
- **user_profiles**: Extended user profile data

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | User registration | No |
| POST | `/login` | User login | No |
| POST | `/verify-email` | Email verification | No |
| POST | `/resend-verification` | Resend verification email | No |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password | No |
| GET | `/me` | Get current user | Yes |
| POST | `/logout` | Logout | Yes |

### Shop Management (`/api/shop`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create shop | Yes |
| GET | `/my-shop` | Get user's shop | Yes |
| PUT | `/my-shop` | Update shop | Yes |
| DELETE | `/my-shop` | Delete shop | Yes |
| GET | `/:shopId` | Get shop by ID | No |
| GET | `/` | Get all shops (paginated) | No |
| GET | `/my-shop/stats` | Get shop statistics | Yes |

### User Management (`/api/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| DELETE | `/profile` | Delete user profile | Yes |
| PUT | `/change-password` | Change password | Yes |
| GET | `/dashboard` | Get dashboard data | Yes |
| DELETE | `/account` | Delete account | Yes |

## 🔐 Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📧 Email Templates

The system includes beautiful HTML email templates for:

- **Welcome Email**: Sent after successful shop creation
- **Verification Email**: Email verification during signup
- **Password Reset**: Password reset functionality

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 🚀 Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper CORS origins
4. Set up environment-specific email services
5. Use a production database (PostgreSQL/MySQL recommended)

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js             # Authentication middleware
│   └── validation.js       # Input validation
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── shop.js             # Shop management routes
│   └── user.js             # User management routes
├── services/
│   └── emailService.js     # Email service
├── data/                   # SQLite database files
├── server.js               # Main server file
├── package.json
├── env.example
└── README.md
```

## 🤝 Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include input validation
4. Write tests for new features
5. Update documentation

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please contact the development team.
