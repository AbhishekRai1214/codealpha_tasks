# Collab Project Manager

A collaborative project management application built with React, Vite, Node.js, Express, MongoDB, and Socket.IO.

## Features

- User authentication with JWT
- Create and manage projects
- Create and track tasks
- Real-time updates with Socket.IO
- Responsive dashboard interface

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Real-time: Socket.IO

## Project Structure

- frontend/: React application
- backend/: Express API server

## Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB connection string

## Environment Setup

Create a .env file in the backend folder with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## Installation

### 1) Install root dependencies

```bash
npm install
```

### 2) Install frontend and backend dependencies

```bash
npm run dev
```

This runs both the backend and frontend concurrently.

## Run Locally

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Notes

- Make sure MongoDB is running before starting the backend.
- For production deployment, build the frontend with:

```bash
cd frontend
npm run build
```
