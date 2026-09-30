# Todo App

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>

A modern full-stack task management application for organizing work, tracking deadlines, and keeping projects under control.

## Overview

Todo App is a productivity-focused web application built with a React frontend and a Node.js/Express backend. It allows users to create tasks, assign categories, set priorities, monitor due dates, and filter the list based on status or urgency. The app includes authentication, protected routes, and a dashboard designed to make day-to-day task tracking more efficient.

## Features

- User registration and login
- JWT-based authentication and protected routes
- Task creation, editing, and deletion
- Task completion status updates
- Priority labels: low, medium, high
- Due date tracking with overdue detection
- Category management
- Search and filtering by:
  - status
  - priority
  - category
  - due date
  - text search
- Sort and pagination support
- Responsive dashboard UI
- Animated background and modern styling

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
- Helmet
- Express Rate Limit

## Project Structure

```text
todo-app/
├── backend/
│   ├── src/
│   ├── package.json
│   └── .gitignore
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
├── .gitignore
├── README.md
└── LICENSE
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

Create a `.env` file inside the `backend` folder with the following values:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/todo_app
JWT_SECRET=your_secret_key
```

### 5. Run the application

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Then open the app in your browser at:

```text
http://localhost:5173
```

## Database Setup

This project expects a PostgreSQL database with the required tables for:
- users
- categories
- tasks

Make sure your database is running and the connection URL in the backend `.env` file matches your local configuration.

## Screenshots

The application includes:
- login and registration pages
- protected dashboard with task management
- task filters and search
- category controls
- task status statistics

## License

This project is licensed under the MIT License.

## Author

Talha3425S

## Repository

- GitHub: https://github.com/Talha3425S/Todo-app
