# CrowdSolve Platform

A full-stack MERN application for collaborative community problem-solving.

## Features

- User authentication (register/login)
- Post community problems with categories and urgency levels
- Propose solutions to problems
- Upvote problems and solutions
- Accept solutions as problem owner
- Responsive Material-UI design
- Real-time updates

## Tech Stack

- **Frontend**: React, Material-UI, React Router
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT tokens
- **Security**: Helmet, CORS, rate limiting

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/znabhi/crowdsolve-platform.git
   cd crowdsolve-platform

# Backend Setup

## Navigate to backend directory
`cd backend`

## Install dependencies
`npm install`

## Set up environment variables
`cp .env.example .env`

```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crowdsolve
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

# Frontend Setup
```bash
cd ../frontend
npm install
```
# Database Setup
```bash
sudo systemctl start mongod
```

# Running the Application

#### Start the Backend Server (Terminal 1):
```bash
cd backend
npm run dev
```
##### Server will run on: http://localhost:5000

#### Start the Frontend Development Server (Terminal 2):
```bash
cd frontend
npm start
```
##### Application will open at: http://localhost:3000

# Project Structure
```bash
crowdsolve-platform/
├── backend/
│   ├── models/          # MongoDB models (User, Problem, Solution)
│   ├── routes/          # API routes (auth, problems, solutions)
│   ├── middleware/      # Authentication & security middleware
│   ├── config/          # Database configuration
│   └── server.js        # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages
│   │   ├── context/     # React context (Auth)
│   │   ├── utils/       # Utilities and API configuration
│   │   └── App.js       # Main App component
│   └── public/          # Static assets
└── README.md
```


## Authors
#### Abhishek Jain - znabhi02