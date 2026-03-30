# NEXCARE Healthcare System

A comprehensive healthcare management system built for CSE616 Capstone Project at the University of Chittagong.

![NEXCARE](https://img.shields.io/badge/NEXCARE-Healthcare%20System-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)

## 📋 Overview

NEXCARE is a full-stack healthcare management system that enables:
- *Patients* to book appointments, view lab reports, and manage their health records
- *Doctors* to manage appointments and view patient history
- *Administrators* to manage users, departments, and branches
- *Pathologists* to upload and manage lab reports

## 🚀 Features

### Patient Portal
- Online appointment booking with multi-step wizard
- View and download lab reports
- Medical history management
- Real-time notifications

### Doctor Dashboard
- Today's appointments overview
- Patient history and records
- Appointment status management
- Lab report access

### Admin Panel
- User management (CRUD)
- Department management
- Branch management
- System statistics dashboard

### Pathologist Portal
- Lab report upload
- Report status management
- Patient assignment

## 🛠️ Tech Stack

### Backend
- *Runtime*: Node.js with Express.js
- *Database*: MYSQL with Prisma ORM
- *Authentication*: JWT
- *Real-time*: Socket.io
- *Password Hashing*: bcryptjs

### Frontend
- *Framework*: React 18 with Vite
- *Styling*: TailwindCSS
- *Routing*: React Router v6
- *HTTP Client*: Axios
- *Notifications*: React Hot Toast
- *Icons*: Lucide React

## 📁 Project Structure
```
nexcare/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.js                # Seed data
│   ├── src/
│   │   ├── controllers/           # Route handlers
│   │   ├── middleware/            # Auth & role middleware
│   │   ├── routes/                # API routes
│   │   └── index.js               # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable components
│   │   ├── contexts/              # React contexts
│   │   ├── pages/                 # Page components
│   │   │   ├── admin/             # Admin pages
│   │   │   ├── doctor/            # Doctor pages
│   │   │   ├── patient/           # Patient pages
│   │   │   ├── pathologist/       # Pathologist pages
│   │   │   └── public/            # Public pages
│   │   └── services/              # API services
│   └── package.json
└── README.md
```
## 🔧 Installation

### Prerequisites
- Node.js 18 or higher
- MySQL 8.0 or higher
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
cd backend

2. Install dependencies:
npm install

3. Create .env file:
env
DATABASE_URL="mysql://username:password@localhost:3306/nexcare_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=5000

4. Generate Prisma client and run migrations:
npx prisma generate
npx prisma migrate dev --name init

5. Seed the database:
npm run seed

6. Start the server:
npm run dev

### Frontend Setup

1. Navigate to frontend directory:
cd frontend

2. Install dependencies:
npm install

3. Start the development server:
npm run dev

The app will be available at http://localhost:5173

## 🔐 Demo Accounts

After seeding the database, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nexcare.com | Password123! |
| Doctor | dr.rahman@nexcare.com | Password123! |
| Patient | rahim@email.com | Password123! |
| Pathologist | pathologist@nexcare.com | Password123! |

## 📡 API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login
- GET /api/auth/me - Get current user
- PUT /api/auth/profile - Update profile

### Appointments
- GET /api/appointments/slots - Get available slots
- POST /api/appointments - Book appointment
- GET /api/appointments - List appointments
- PUT /api/appointments/:id - Update appointment
- DELETE /api/appointments/:id - Cancel appointment

### Doctors
- GET /api/doctors - List all doctors
- GET /api/doctors/:id - Get doctor details
- GET /api/doctors/my/dashboard - Doctor dashboard

### Patients
- GET /api/patients/my/dashboard - Patient dashboard
- GET /api/patients/my/appointments - Patient appointments
- GET /api/patients/my/lab-reports - Patient lab reports

### Lab Reports
- POST /api/lab-reports - Create lab report
- GET /api/lab-reports - List lab reports
- PUT /api/lab-reports/:id - Update lab report

### Admin
- GET /api/users - List users
- POST /api/users - Create user
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user
- GET /api/departments - List departments
- GET /api/branches - List branches

## 🎨 UI Features

- *Modern Design*: Clean, professional healthcare UI
- *Responsive*: Works on desktop, tablet, and mobile
- *Animations*: Smooth transitions and micro-interactions
- *Dark/Light*: Optimized color palette for readability
- *Accessibility*: Proper contrast and keyboard navigation

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Input validation

## 📱 Screenshots

### Home Page
Premium landing page with hero section, services, testimonials, and CTA.
![WhatsApp Image 2026-03-30 at 8 46 39 AM](https://github.com/user-attachments/assets/d014029f-b3db-467c-a909-400d473f913f)


### Login/Register
Beautiful split-screen layout with form validation.
![WhatsApp Image 2026-03-30 at 8 47 02 AM](https://github.com/user-attachments/assets/2bbdd2cd-44ab-44db-a8c3-47fd79f76667)

### Patient Dashboard

Stats overview, upcoming appointments, and lab reports.
![WhatsApp Image 2026-03-30 at 8 58 02 AM (1)](https://github.com/user-attachments/assets/cb44baed-c39b-4584-a44f-0f1f2182bba1)

### Doctor Dashboard

Today's schedule, patient list, and appointment management.
![WhatsApp Image 2026-03-30 at 8 58 02 AM](https://github.com/user-attachments/assets/cbcd00a4-9247-4abe-b9f9-fbb3a4cd876d)


### Admin Dashboard
System statistics, user management, and configuration.

![WhatsApp Image 2026-03-30 at 8 58 00 AM](https://github.com/user-attachments/assets/00e6d546-9758-476d-95dd-2bd1203d10a6)

## 🧪 Testing

# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

## 📝 License

This project is developed for CSE616 Capstone Project at University of Chittagong.

## 👥 Contributors

- *Project Lead*: CSE616 Students
- *Course*: CSE616 Capstone Project
- *Institution*: University of Chittagong

## 📧 Contact

For questions or support, please contact:
- Email: info@nexcare.com
- Phone: +880 31-123-4567

---

Made with ❤️ for better healthcare management
img.shields.io
