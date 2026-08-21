# Backend Ledger

A RESTful backend service for bank ledger and transaction management, built with Node.js, Express, and MongoDB. Features JWT-based authentication, secure session handling, and a modular MVC architecture.

Live API: [backend-ledger-vhrd.onrender.com](https://backend-ledger-vhrd.onrender.com/)

## Features

- User authentication (register, login, logout) with JWT and hashed passwords
- Account creation and balance retrieval (protected routes)
- Transaction processing, including system-level initial funds transactions
- Blacklist model for token/session invalidation on logout
- Email service integration (OAuth2-based, via Nodemailer)
- Modular MVC architecture (controllers, models, routes, middleware, services)

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JSON Web Tokens (JWT), bcrypt.js, cookie-parser
- **Email:** Nodemailer with OAuth2
- **Other:** dotenv
- **Deployment:** Render

## Project Structure
src/
├── config/ # Database configuration
├── controllers/ # Auth, account, and transaction logic
├── middleware/ # JWT auth & system-user auth middleware
├── models/ # User, Account, Transaction, Ledger, Blacklist schemas
├── routes/ # Auth, account, and transaction routes
├── services/ # Email service
└── app.js # Express app entry point
### Prerequisites
- Node.js installed
- MongoDB instance (local or Atlas)
- Google OAuth2 credentials (for email service)

### Installation

```bash
git clone https://github.com/Sharmarjun25/Backend-ledger.git
cd Backend-ledger
npm install
```

### Environment Variables

Create a `.env` file in the root with:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
REFRESH_TOKEN=your_google_oauth_refresh_token
EMAIL_USER=your_email_address

### Run

```bash
npm run dev    # development (nodemon)
npm start      # production
```

## API Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|--------------|----------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Log in and receive JWT | No |
| POST | `/api/auth/logout` | Log out, blacklist token | Yes |
| POST | `/api/accounts` | Create a new account | Yes |
| GET | `/api/accounts` | Get all accounts for the logged-in user | Yes |
| GET | `/api/accounts/balance/:accountId` | Get balance for a specific account | Yes |
| POST | `/api/transactions` | Create a transaction | Yes |
| POST | `/api/transactions/system/initial-funds` | Seed initial funds (system-level) | System auth |
