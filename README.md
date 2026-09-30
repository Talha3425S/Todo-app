# Todo App

A full-stack task management application built with React, Vite, Node.js, Express, PostgreSQL, and JWT authentication.

## Overview

Todo App helps users create, organize, filter, and track tasks with priority, due dates, categories, and status updates. The dashboard provides a clean interface for managing daily work and keeping progress visible.

## Features

- User registration and login
- JWT-based authentication
- Protected dashboard routes
- Create, update, delete, and complete tasks
- Due date tracking and overdue detection
- Search and filtering by status, priority, category, and date
- Sort and pagination support
- Category management
- Responsive React UI

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Three.js / React Three Fiber

### Backend
- Node.js
- Express
- PostgreSQL
- JWT
- Joi validation
- Helmet and rate limiting

## Project Structure

```text
todo-app/
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── README.md
├── .gitignore
└── package.json
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Talha3425S/Todo-app.git
cd Todo-app
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure environment variables

Create a `.env` file in the backend folder with your PostgreSQL connection details and JWT secret:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/todo_app
JWT_SECRET=your_secret_key
```

### 5. Start the app

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## License

This project is for educational and personal use.

## Author

Talha3425S
