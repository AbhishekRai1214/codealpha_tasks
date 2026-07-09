# CodeAlpha Task Projects

This repository contains two complete full-stack web applications combined into a single GitHub project for portfolio and learning purposes.

## Projects Included

### 1. Project 1 - Collaborative Project Manager
A modern task and project management app inspired by tools like Trello and Asana. It allows users to register, create projects, manage tasks, and collaborate in real time.

#### Key Features
- User authentication and protected routes
- Create, update, and delete projects
- Create and manage tasks for each project
- Real-time collaboration using Socket.IO
- Responsive dashboard for project tracking
- Clean React-based interface for managing work efficiently

#### Tech Stack
- Frontend: React, Vite, React Router
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Real-time communication: Socket.IO
- Authentication: JWT

#### Main Structure
- project1/frontend/: React frontend application
- project1/backend/: Express API and MongoDB integration

#### Run Project 1 Locally
```bash
cd project1
npm install
npm run dev
```

Then open:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

### 2. Project 2 - ShopNest Ecommerce Platform
A full-stack ecommerce application designed for browsing products, placing orders, and managing store operations. It includes user authentication, product management, cart and checkout flow, payment integration, and admin analytics.

#### Key Features
- Product listing and detailed product pages
- User registration and login system
- Secure authentication with JWT
- Admin dashboard for managing products and orders
- Product image upload support with Cloudinary/local fallback
- Payment integration with Razorpay
- Order management and analytics
- Responsive storefront experience

#### Tech Stack
- Frontend: React, React Router, Redux-style state management
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- File uploads: Multer
- Cloud storage: Cloudinary
- Payments: Razorpay
- Email notifications: Nodemailer

#### Main Structure
- project2/frontend/: Ecommerce frontend
- project2/backend/: REST API, authentication, products, orders, payments, analytics

#### Run Project 2 Locally
```bash
cd project2
npm install
npm install --prefix backend
npm install --prefix frontend
npm run dev
```

The app will start both the backend and frontend services together.

---

## Prerequisites
Before running either project, make sure you have:
- Node.js installed
- MongoDB running locally or a valid MongoDB connection string
- A Cloudinary account if you want image uploads to work fully
- Razorpay credentials for payment testing

## Environment Setup
Each project uses environment variables for configuration.

### For Project 1
Create a .env file inside project1/backend with:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### For Project 2
Create a .env file inside project2/backend with:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GMAIL_USER=your_email@example.com
GMAIL_PASS=your_email_password
```

## Repository Structure
```text
codealpha_tasks/
├── project1/
│   ├── backend/
│   └── frontend/
├── project2/
│   ├── backend/
│   └── frontend/
├── README.md
└── .gitignore
```

## Summary
This repository showcases two different application concepts:
- A collaborative work management platform
- A modern ecommerce marketplace

Together, they demonstrate strong full-stack development skills including authentication, REST APIs, database design, real-time features, and deployment-ready application architecture.
