# Freelance Helper

A full-stack web application for freelancers to manage the entire client workflow from lead to payment. The app includes authentication, client records, project tracking, invoicing, dashboard analytics, and personal business settings in a single place.

## Overview

Freelance Helper is designed for independent professionals who want to keep contracts, clients, projects, billing, and account settings organized without juggling multiple tools. It combines a React + Vite frontend with a Node.js + Express + MongoDB API to provide a clean, end-to-end freelance operations dashboard.

## Features

- User registration and login
- JWT-based authenticated API access
- Dashboard overview for freelancing operations
- Client management with create, read, update, delete flows
- Project management tied to clients
- Invoice management, including creation and updates
- Business profile and settings management
- Secure password updates and profile updates
- Responsive single-page frontend for day-to-day use

## Tech Stack

### Frontend
- React 19
- Vite 8
- React Router DOM
- Axios for API requests
- jsPDF + jsPDF AutoTable for invoice generation/export
- Lucide React for icons
- Tailwind CSS (configured via Vite plugin)

### Backend
- Node.js (>= 20.19.0)
- Express 5
- MongoDB via Mongoose
- JWT authentication
- bcryptjs password hashing
- CORS support
- dotenv environment management

### Deployment / Runtime Notes
- Frontend API client is configured to call:
  - https://freelance-helper.onrender.com/api/v1
- Frontend CORS origin includes:
  - https://freelance-helper-six.vercel.app
  - http://localhost:5173

## Project Structure

```text
freelance-helper/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClientModal.jsx
│   │   │   ├── InvoiceModal.jsx
│   │   │   └── ProjectModal.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Clients.jsx
│   │   │   ├── ClientDetails.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Invoices.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Settings.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── .gitignore
│   └── README.md
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── auth.js
│   │   ├── clients.js
│   │   ├── projects.js
│   │   └── invoices.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── clients.js
│   │   ├── projects.js
│   │   └── invoices.js
│   ├── package.json
│   ├── server.js
│   └── .gitignore
│
├── .gitignore
└── README.md
```

## Architecture

The application follows a split frontend/backend architecture:

- Client app (`/client`): React SPA for the user interface
- Server app (`/server`): Express API for all business logic and persistence
- Database: MongoDB with Mongoose models
- Authentication: JWT with protected routes through middleware

### Client flow

The client bootstraps in `client/src/main.jsx` and renders the application defined in `client/src/App.jsx`. It uses:

- `client/src/context/AuthContext.jsx` to manage auth state
- `client/src/utils/api.js` as the centralized API client
- `client/src/pages/*` for page-level screens
- `client/src/components/*` for reusable modals and UI elements

### Server flow

The server boots in `server/server.js` and mounts the following route groups:

- `/api/v1/auth`
- `/api/v1/clients`
- `/api/v1/projects`
- `/api/v1/invoices`

The API uses protected routes and MongoDB models to access and mutate user-, client-, project-, and invoice-related data.

## Getting Started

### Prerequisites

- Node.js >= 20.19.0
- npm
- MongoDB instance or MongoDB Atlas connection string

## Installation

### 1) Clone the repository

```bash
git clone https://github.com/Himansu-Kumar/freelance-helper.git
cd freelance-helper
```

### 2) Install frontend dependencies

```bash
cd client
npm install
```

### 3) Install backend dependencies

```bash
cd ../server
npm install
```

## Environment Variables

Create a `.env` file in the `server/` directory with the following values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/freelance-helper
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
```

Notes:
- `MONGO_URI` should point to your MongoDB instance.
- `JWT_SECRET` should be a strong secret value for signing tokens.
- `JWT_EXPIRE` controls token lifetime.

If you're using a production DB or deployment platform, set these environment variables in your hosting provider instead of committing them to version control.

## Running the Project

### Start the backend

```bash
cd server
npm run dev
```

or for production:

```bash
cd server
npm start
```

The backend server listens on `PORT` (default: `5000`).

### Start the frontend

```bash
cd client
npm run dev
```

Then open the local Vite URL shown in the terminal (typically `http://localhost:5173`).

## Production Build

Build the frontend app for deployment:

```bash
cd client
npm run build
```

This creates a production build in the `client/dist` directory.

## Available Scripts

### Client scripts

```bash
cd client
npm run dev      # start Vite dev server
npm run build    # build production assets
npm run preview  # preview built site locally
npm run lint     # run ESLint
```

### Server scripts

```bash
cd server
npm run dev      # run with nodemon
npm start        # run server.js directly
```

## API Endpoints

The server exposes these main API groups:

### Authentication
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `PUT /api/v1/auth/me`
- `PUT /api/v1/auth/updatepassword`

### Clients
- `GET /api/v1/clients`
- `POST /api/v1/clients`
- `GET /api/v1/clients/:id`
- `PUT /api/v1/clients/:id`
- `DELETE /api/v1/clients/:id`

### Projects
- `GET /api/v1/clients/:clientId/projects`
- `POST /api/v1/clients/:clientId/projects`
- `GET /api/v1/clients/:clientId/projects/:id`
- `PUT /api/v1/clients/:clientId/projects/:id`
- `DELETE /api/v1/clients/:clientId/projects/:id`

### Invoices
- `GET /api/v1/invoices`
- `POST /api/v1/invoices`
- `GET /api/v1/invoices/:id`
- `PUT /api/v1/invoices/:id`
- `DELETE /api/v1/invoices/:id`

## Security Notes

- Passwords are hashed with `bcryptjs`
- JWT tokens are used for auth-protected routes
- Protected routes use middleware in `server/middleware/auth.js`
- CORS is enabled for the frontend deployment URL and local dev environment

## Roadmap / Extension Ideas

The current codebase is a solid foundation for:

- Payment tracking and reminders
- Contract templates and file uploads
- Expense tracking and tax reports
- Dashboard widgets and analytics
- Multi-user team accounts or roles
- PDF invoice export improvements

## Contributing

Contributions are welcome. To contribute:

```bash
git checkout -b feature/my-change
# make your changes
# test locally
git add .
git commit -m "Add my change"
git push origin feature/my-change
```

Then open a pull request on GitHub.

## License

This project does not currently include a license file in the repository root. If you plan to distribute or collaborate publicly, consider adding an open-source license such as MIT.

## Repository

- GitHub: https://github.com/Himansu-Kumar/freelance-helper

## Contact

- Author: Himansu-Kumar
- Project: Freelance Helper

## Status

The repository is actively structured as a full-stack JavaScript application for managing freelance business operations in a single dashboard.
