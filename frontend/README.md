# Job Tracker Pro — Frontend

Frontend for a full-stack job application tracker. Built with React + Vite, styled with Tailwind CSS, and connects to a Django REST Framework backend via JWT authentication.

## Tech Stack

- **React 19** + **Vite** — fast dev server and build tooling
- **Tailwind CSS v4** — utility-first styling with a custom design system
- **React Router v6** — client-side routing
- **Axios** — API communication with the Django backend
- **React Hook Form** — form handling and validation
- **Recharts** — analytics dashboard charts
- **react-hot-toast** — notifications
- **lucide-react** — icons

## Project Structure
src/
api/ # Axios instance and API call functions
components/
ui/ # Reusable UI primitives (Button, Input, Card, Badge, Modal, Spinner)
layout/ # Navbar, Sidebar, Page Container
features/ # Feature-based modules (auth, applications, dashboard)
context/ # Global state (auth context)
hooks/ # Custom React hooks
pages/ # Route-level page components
routes/ # Route definitions and protected route logic
utils/ # Helper functions and constants


## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running (see `../backend/README.md`)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start the dev server
npm run dev
```

The app runs at `http://localhost:5173` by default and expects the backend API at the URL set in `.env` (`VITE_API_BASE_URL`).

### Build for production

```bash
npm run build
```

## Features

- JWT-based authentication (login/register, token refresh, protected routes)
- Add, edit, and delete job applications
- Track application status: Applied, Interview, Offer, Rejected
- Search and filter applications
- Analytics dashboard — response rate, status breakdown, applications over time
- Fully responsive design

## Status

 In progress — currently building out Stage 2 (authentication and core pages).
