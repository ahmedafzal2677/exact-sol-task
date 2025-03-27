# Task Management System

A modern task management application built with React, TypeScript, and TanStack Query. The system supports both user and admin roles with different functionalities for each.

## Features

- User and Admin authentication
- Task creation, editing, and deletion
- Real-time task updates via WebSocket
- Role-based access control
- Task status management
- Priority-based task organization
- Responsive design

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Installation

1. Clone the repository:
```bash
gh repo clone ahmedafzal2677/exact-sol-task
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:5173`

## Login Credentials

### Admin User
- Email: anc@xyz.com
- Password: abc123

### Regular Users
- Email: john@xyz.com
- Password: john123
- Email: jane@xyz.com
- Password: jane123


## Technologies Used

- React 19
- TypeScript
- TanStack Query (React Query)
- React Router DOM
- Axios
- WebSocket
- CSS Modules
