Support Ticket Management System
Overview

This project is a support ticket management system built with Next.js, TypeScript, and MongoDB. It allows:

Client users to create, view, and manage their own tickets.

Agent users to manage all tickets: assign tickets, update status and priority, and close tickets.

Role-based authentication with NextAuth, supporting both email/password and Google login.

Protected routes based on user roles (client and agent).

Basic notifications and real-time ticket updates from the interface.

Prerequisites

Before running the project, make sure you have:

Node.js (>=18 recommended) and npm or yarn.

MongoDB running locally or in the cloud (Mongo Atlas).

Environment variables in a .env.local file:

MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=a_secret_key_for_nextauth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_SERVER=smtp://user:password@host:port
EMAIL_FROM=support@yourdomain.com


🔹 EMAIL_* is optional if you want to send email notifications.

Installation and Setup

Clone the repository

git clone https://github.com/pingui001/E-commerce.git
cd E-commerce


Install dependencies

npm install
# or
yarn


Create a .env.local file with your credentials (see prerequisites).

Run the development server

npm run dev
# or
yarn dev


The app will run at http://localhost:3000.

Users can register or log in and access their dashboard based on their role.

Project Structure
/app
  /api
    /auth/[...nextauth]/route.ts   # NextAuth configuration
    /tickets/route.ts               # Ticket API endpoints
    /users/route.ts                 # Agent listing endpoint
  /agent-tickets/page.tsx          # Agent dashboard
  /dashboard/page.tsx              # Client dashboard
  /login/page.tsx                  # Login page
  /register/page.tsx               # Registration page
/models
  Ticket.ts                         # Ticket model
  User.ts                           # User model
/styles
  tickets.module.scss               # Client panel styles
  agent-tickets.module.scss         # Agent panel styles
/lib
  mongodb.ts                        # MongoDB connection

Ticket Fields

Each ticket includes:

title

description

createdBy (reference to client user)

assignedTo (optional, reference to agent user)

status: "open" | "in_progress" | "resolved" | "closed"

priority: "low" | "medium" | "high"

createdAt and updatedAt

Agent assignment is done via a dropdown selector in the UI that sends the agent’s _id to the API to prevent MongoDB type errors.


Nicolas Porras Patiño
gosling
nicolasporras0910@gmail.com
1000414068

<img width="1087" height="521" alt="Captura desde 2025-12-09 13-32-38" src="https://github.com/user-attachments/assets/7137eed0-f916-45c9-9d0b-f001c2de22ee" />



<img width="1087" height="521" alt="Captura desde 2025-12-09 13-33-33" src="https://github.com/user-attachments/assets/4c51306c-41dc-4e4f-b9c4-ec91f1b81fca" />


<img width="1087" height="521" alt="Captura desde 2025-12-09 13-32-55" src="https://github.com/user-attachments/assets/25c7d06b-2905-4e5e-b866-7f36824569ab" />



