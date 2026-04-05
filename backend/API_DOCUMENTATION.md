# NEXCARE Healthcare System API Documentation

**Base URL:** `http://localhost:5001/api`

**Version:** 1.0.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Doctors](#doctors)
4. [Patients](#patients)
5. [Appointments](#appointments)
6. [Lab Reports](#lab-reports)
7. [Laboratories](#laboratories)
8. [Locations](#locations)
9. [Branches](#branches)
10. [Departments](#departments)
11. [Specialties](#specialties)
12. [Diagnostics](#diagnostics)
13. [Error Handling](#error-handling)
14. [Authentication & Authorization](#authentication--authorization)

---

## Authentication

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Authentication:** None (Public)

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "Patient",
  "gender": "Male",
  "phone": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "user": {
      "id": "d098ffcc-193d-486d-a517-4ff67af43cb0",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "Patient"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Patient"
  }'
```

---

### Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /auth/login`

**Authentication:** None (Public)

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "d098ffcc-193d-486d-a517-4ff67af43cb0",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "Patient"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

---

### Get Current User

Get authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Authentication:** Required (Bearer Token)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "d098ffcc-193d-486d-a517-4ff67af43cb0",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Patient",
    "gender": "Male",
    "phone": "+1234567890",
    "profileImage": null,
    "patient": {
      "id": "patient-uuid",
      "medicalHistory": "No known allergies"
    }
  }
}
```

**Example:**
```bash
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Update Profile

Update authenticated user's profile.

**Endpoint:** `PUT .../auth/profile`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "gender": "Male"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "id": "d098ffcc-193d-486d-a517-4ff67af43cb0",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "role": "Patient"
  }
}
```

---

### Change Password

Change authenticated user's password.

**Endpoint:** `PUT .../auth/change-password`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "currentPassword": "OldPass",
  "newPassword": "NewSecurePass"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully."
}
```

---

### Forgot Password

Request password reset OTP via email.

**Endpoint:** `POST .../auth/forgot-password`

**Authentication:** None (Public)

**Request Body:**
```json
{
  "email": "arafatsheikh098@gmail.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent to your email."
}
```

---

### Verify OTP

Verify OTP for password reset.

**Endpoint:** `POST .../auth/verify-otp`

**Authentication:** None (Public)

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP verified successfully."
}
```

---

### Reset Password

Reset password after OTP verification.

**Endpoint:** `POST .../auth/reset-password`

**Authentication:** None (Public)

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass789!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully."
}
```

---

## Users

### Get All Users

Get list of all users (Admin only).

**Endpoint:** `GET /users`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid-1",
      "email": "user1@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "Patient",
      "createdAt": "2026-02-08T12:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50
  }
}
```

**Example:**
```bash
curl -X GET "http://localhost:5001/api/users?page=1&limit=10&role=Patient" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

### Get User by ID

Get specific user details.

**Endpoint:** `GET /users/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Patient",
    "gender": "Male",
    "phone": "+1234567890"
  }
}
```

---

### Update User

Update user information (Admin only).

**Endpoint:** `PUT /users/:id`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "role": "Doctor"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully.",
  "data": {
    "id": "user-uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "role": "Doctor"
  }
}
```

---

### Delete User

Delete user account (Admin only).

**Endpoint:** `DELETE /users/:id`

**Authentication:** Required (Admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully."
}
```

---

## Doctors

### Get All Doctors

Get list of all approved doctors (Public).

**Endpoint:** `GET /doctors`

**Authentication:** None (Public)

**Query Parameters:**
- `specialtyId` (optional): Filter by specialty
- `departmentId` (optional): Filter by department
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "doctor-uuid",
      "userId": "user-uuid",
      "qualification": "MBBS, MD",
      "experienceYears": 10,
      "isApproved": true,
      "user": {
        "firstName": "Dr. Jane",
        "lastName": "Smith",
        "email": "dr.jane@hospital.com"
      },
      "department": {
        "id": "dept-uuid",
        "name": "Cardiology"
      },
      "specialties": [
        {
          "id": "specialty-uuid",
          "name": "Interventional Cardiology"
        }
      ]
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:5001/api/doctors?specialtyId=specialty-uuid" \
  -H "Content-Type: application/json"
```

---

### Get Doctor by ID

Get specific doctor details.

**Endpoint:** `GET /doctors/:id`

**Authentication:** None (Public)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "doctor-uuid",
    "qualification": "MBBS, MD",
    "experienceYears": 10,
    "user": {
      "firstName": "Dr. Jane",
      "lastName": "Smith",
      "email": "dr.jane@hospital.com",
      "phone": "+1234567890"
    },
    "department": {
      "name": "Cardiology"
    },
    "specialties": [
      {
        "name": "Interventional Cardiology"
      }
    ]
  }
}
```

---

### Get Pending Doctors

Get list of doctors pending approval (Admin only).

**Endpoint:** `GET /doctors/pending/list`

**Authentication:** Required (Admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "doctor-uuid",
      "qualification": "MBBS",
      "experienceYears": 5,
      "isApproved": false,
      "user": {
        "firstName": "Dr. John",
        "lastName": "Doe",
        "email": "dr.john@example.com"
      }
    }
  ]
}
```

---

### Approve Doctor

Approve pending doctor (Admin only).

**Endpoint:** `PUT /doctors/:id/approve`

**Authentication:** Required (Admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Doctor approved successfully.",
  "data": {
    "id": "doctor-uuid",
    "isApproved": true
  }
}
```

---

### Reject Doctor

Reject pending doctor (Admin only).

**Endpoint:** `PUT /doctors/:id/reject`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "rejectedReason": "Insufficient qualifications"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Doctor rejected.",
  "data": {
    "id": "doctor-uuid",
    "isApproved": false,
    "rejectedReason": "Insufficient qualifications"
  }
}
```

---

### Get Doctor Dashboard

Get doctor's dashboard data (Doctor only).

**Endpoint:** `GET /doctors/my/dashboard`

**Authentication:** Required (Doctor only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalAppointments": 150,
    "upcomingAppointments": 12,
    "todayAppointments": 5,
    "completedAppointments": 133,
    "recentAppointments": [
      {
        "id": "appt-uuid",
        "appointmentDate": "2026-02-08",
        "appointmentTime": "10:00 AM",
        "status": "Scheduled",
        "patient": {
          "user": {
            "firstName": "John",
            "lastName": "Doe"
          }
        }
      }
    ]
  }
}
```

---

### Get Doctor Appointments

Get appointments for a specific doctor.

**Endpoint:** `GET /doctors/:id/appointments`

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status
- `date` (optional): Filter by date

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "appt-uuid",
      "appointmentDate": "2026-02-10",
      "appointmentTime": "2:00 PM",
      "status": "Scheduled",
      "patient": {
        "user": {
          "firstName": "Jane",
          "lastName": "Smith"
        }
      }
    }
  ]
}
```

---

## Patients

### Get Patient Dashboard

Get patient's dashboard data (Patient only).

**Endpoint:** `GET /patients/my/dashboard`

**Authentication:** Required (Patient only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalAppointments": 25,
    "upcomingAppointments": 3,
    "completedAppointments": 20,
    "pendingLabReports": 2,
    "recentAppointments": [
      {
        "id": "appt-uuid",
        "appointmentDate": "2026-02-15",
        "appointmentTime": "3:00 PM",
        "status": "Scheduled",
        "doctor": {
          "user": {
            "firstName": "Dr. Jane",
            "lastName": "Smith"
          }
        }
      }
    ],
    "recentLabReports": [
      {
        "id": "report-uuid",
        "reportName": "Blood Test",
        "reportDate": "2026-02-05",
        "status": "Completed"
      }
    ]
  }
}
```

---

### Get Patient Appointments

Get patient's appointments (Patient only).

**Endpoint:** `GET /patients/my/appointments`

**Authentication:** Required (Patient only)

**Query Parameters:**
- `status` (optional): Filter by status

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "appt-uuid",
      "appointmentDate": "2026-02-15",
      "appointmentTime": "3:00 PM",
      "status": "Scheduled",
      "doctor": {
        "user": {
          "firstName": "Dr. Jane",
          "lastName": "Smith"
        },
        "department": {
          "name": "Cardiology"
        }
      },
      "branch": {
        "name": "Main Hospital"
      }
    }
  ]
}
```

---

### Get Patient Lab Reports

Get patient's lab reports (Patient only).

**Endpoint:** `GET /patients/my/lab-reports`

**Authentication:** Required (Patient only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "report-uuid",
      "reportName": "Blood Test",
      "reportDate": "2026-02-05",
      "status": "Completed",
      "filePath": "/uploads/reports/blood-test.pdf",
      "laboratory": {
        "name": "Central Lab"
      }
    }
  ]
}
```

---

### Get All Patients

Get list of all patients (Admin/Doctor only).

**Endpoint:** `GET /patients`

**Authentication:** Required (Admin/Doctor only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "patient-uuid",
      "medicalHistory": "No known allergies",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890"
      }
    }
  ]
}
```

---

### Get Patient by ID

Get specific patient details (Admin/Doctor only).

**Endpoint:** `GET /patients/:id`

**Authentication:** Required (Admin/Doctor only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "patient-uuid",
    "medicalHistory": "Diabetes Type 2, Hypertension",
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "gender": "Male"
    },
    "appointments": [
      {
        "id": "appt-uuid",
        "appointmentDate": "2026-02-15",
        "status": "Scheduled"
      }
    ],
    "labReports": [
      {
        "id": "report-uuid",
        "reportName": "Blood Test",
        "status": "Completed"
      }
    ]
  }
}
```

---

## Appointments

### Get Available Slots

Get available appointment slots (Public).

**Endpoint:** `GET /appointments/slots`

**Authentication:** None (Public)

**Query Parameters:**
- `doctorId` (required): Doctor ID
- `date` (required): Date (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "availableSlots": [
      "9:00 AM",
      "10:00 AM",
      "11:00 AM",
      "2:00 PM",
      "3:00 PM"
    ]
  }
}
```

**Example:**
```bash
curl -X GET "http://localhost:5001/api/appointments/slots?doctorId=doctor-uuid&date=2026-02-15"
```

---

### Create Appointment

Create new appointment (Patient only).

**Endpoint:** `POST /appointments`

**Authentication:** Required (Patient only)

**Request Body:**
```json
{
  "doctorId": "doctor-uuid",
  "branchId": "branch-uuid",
  "appointmentDate": "2026-02-15",
  "appointmentTime": "10:00 AM",
  "notes": "Regular checkup"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Appointment created successfully.",
  "data": {
    "id": "appt-uuid",
    "patientId": "patient-uuid",
    "doctorId": "doctor-uuid",
    "branchId": "branch-uuid",
    "appointmentDate": "2026-02-15",
    "appointmentTime": "10:00 AM",
    "status": "Scheduled",
    "notes": "Regular checkup"
  }
}
```

---

### Get All Appointments

Get all appointments (Admin/Doctor only).

**Endpoint:** `GET /appointments`

**Authentication:** Required (Admin/Doctor only)

**Query Parameters:**
- `status` (optional): Filter by status
- `date` (optional): Filter by date
- `doctorId` (optional): Filter by doctor
- `patientId` (optional): Filter by patient

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "appt-uuid",
      "appointmentDate": "2026-02-15",
      "appointmentTime": "10:00 AM",
      "status": "Scheduled",
      "patient": {
        "user": {
          "firstName": "John",
          "lastName": "Doe"
        }
      },
      "doctor": {
        "user": {
          "firstName": "Dr. Jane",
          "lastName": "Smith"
        }
      }
    }
  ]
}
```

---

### Get Appointment by ID

Get specific appointment details.

**Endpoint:** `GET /appointments/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "appt-uuid",
    "appointmentDate": "2026-02-15",
    "appointmentTime": "10:00 AM",
    "status": "Scheduled",
    "notes": "Regular checkup",
    "patient": {
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890"
      }
    },
    "doctor": {
      "user": {
        "firstName": "Dr. Jane",
        "lastName": "Smith"
      },
      "department": {
        "name": "Cardiology"
      }
    },
    "branch": {
      "name": "Main Hospital",
      "location": {
        "city": "Dhaka"
      }
    }
  }
}
```

---

### Update Appointment

Update appointment status (Doctor/Admin only).

**Endpoint:** `PUT /appointments/:id`

**Authentication:** Required (Doctor/Admin only)

**Request Body:**
```json
{
  "status": "Completed",
  "notes": "Patient examined, prescribed medication"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Appointment updated successfully.",
  "data": {
    "id": "appt-uuid",
    "status": "Completed",
    "notes": "Patient examined, prescribed medication"
  }
}
```

---

### Cancel Appointment

Cancel appointment.

**Endpoint:** `DELETE /appointments/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully."
}
```

---

## Lab Reports

### Get All Lab Reports

Get all lab reports (Admin/Pathologist only).

**Endpoint:** `GET /lab-reports`

**Authentication:** Required (Admin/Pathologist only)

**Query Parameters:**
- `status` (optional): Filter by status
- `patientId` (optional): Filter by patient

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "report-uuid",
      "reportName": "Blood Test",
      "reportDate": "2026-02-05",
      "status": "Completed",
      "filePath": "/uploads/reports/blood-test.pdf",
      "patient": {
        "user": {
          "firstName": "John",
          "lastName": "Doe"
        }
      },
      "laboratory": {
        "name": "Central Lab"
      }
    }
  ]
}
```

---

### Create Lab Report

Create new lab report (Pathologist only).

**Endpoint:** `POST /lab-reports`

**Authentication:** Required (Pathologist only)

**Request Body (multipart/form-data):**
```
patientId: patient-uuid
labId: lab-uuid
reportName: Blood Test
reportDate: 2026-02-05
status: Completed
notes: All values within normal range
file: [PDF file]
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Lab report created successfully.",
  "data": {
    "id": "report-uuid",
    "reportName": "Blood Test",
    "reportDate": "2026-02-05",
    "status": "Completed",
    "filePath": "/uploads/reports/blood-test-123456.pdf"
  }
}
```

---

### Get Lab Report by ID

Get specific lab report.

**Endpoint:** `GET /lab-reports/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "report-uuid",
    "reportName": "Blood Test",
    "reportDate": "2026-02-05",
    "status": "Completed",
    "filePath": "/uploads/reports/blood-test.pdf",
    "notes": "All values within normal range",
    "patient": {
      "user": {
        "firstName": "John",
        "lastName": "Doe"
      }
    },
    "laboratory": {
      "name": "Central Lab"
    },
    "pathologist": {
      "user": {
        "firstName": "Dr. Sarah",
        "lastName": "Johnson"
      }
    }
  }
}
```

---

### Update Lab Report

Update lab report (Pathologist only).

**Endpoint:** `PUT /lab-reports/:id`

**Authentication:** Required (Pathologist only)

**Request Body:**
```json
{
  "status": "Completed",
  "notes": "Updated findings"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lab report updated successfully.",
  "data": {
    "id": "report-uuid",
    "status": "Completed",
    "notes": "Updated findings"
  }
}
```

---

## Laboratories

### Get All Laboratories

Get list of all laboratories.

**Endpoint:** `GET /laboratories`

**Authentication:** None (Public)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "lab-uuid",
      "name": "Central Lab",
      "contactNumber": "+1234567890",
      "email": "central.lab@hospital.com",
      "branch": {
        "name": "Main Hospital",
        "location": {
          "city": "Dhaka"
        }
      }
    }
  ]
}
```

---

### Create Laboratory

Create new laboratory (Admin only).

**Endpoint:** `POST /laboratories`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Central Lab",
  "branchId": "branch-uuid",
  "contactNumber": "+1234567890",
  "email": "central.lab@hospital.com"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Laboratory created successfully.",
  "data": {
    "id": "lab-uuid",
    "name": "Central Lab",
    "contactNumber": "+1234567890",
    "email": "central.lab@hospital.com"
  }
}
```

---

## Locations

### Get All Locations

Get list of all locations.

**Endpoint:** `GET /locations`

**Authentication:** None (Public)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "location-uuid",
      "city": "Dhaka",
      "state": "Dhaka Division",
      "country": "Bangladesh",
      "branches": [
        {
          "id": "branch-uuid",
          "name": "Main Hospital"
        }
      ]
    }
  ]
}
```

---

### Create Location

Create new location (Admin only).

**Endpoint:** `POST /locations`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "city": "Dhaka",
  "state": "Dhaka Division",
  "country": "Bangladesh"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Location created successfully.",
  "data": {
    "id": "location-uuid",
    "city": "Dhaka",
    "state": "Dhaka Division",
    "country": "Bangladesh"
  }
}
```

---

## Branches

### Get All Branches

Get list of all branches.

**Endpoint:** `GET /branches`

**Authentication:** None (Public)

**Query Parameters:**
- `locationId` (optional): Filter by location

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "branch-uuid",
      "name": "Main Hospital",
      "address": "123 Medical Street",
      "contactNumber": "+1234567890",
      "location": {
        "city": "Dhaka",
        "country": "Bangladesh"
      }
    }
  ]
}
```

---

### Create Branch

Create new branch (Admin only).

**Endpoint:** `POST /branches`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Main Hospital",
  "locationId": "location-uuid",
  "address": "123 Medical Street",
  "contactNumber": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Branch created successfully.",
  "data": {
    "id": "branch-uuid",
    "name": "Main Hospital",
    "address": "123 Medical Street",
    "contactNumber": "+1234567890"
  }
}
```

---

## Departments

### Get All Departments

Get list of all departments.

**Endpoint:** `GET /departments`

**Authentication:** None (Public)

**Query Parameters:**
- `branchId` (optional): Filter by branch

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "dept-uuid",
      "name": "Cardiology",
      "description": "Heart and cardiovascular care",
      "branch": {
        "name": "Main Hospital"
      }
    }
  ]
}
```

---

### Create Department

Create new department (Admin only).

**Endpoint:** `POST /departments`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Cardiology",
  "description": "Heart and cardiovascular care",
  "branchId": "branch-uuid"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Department created successfully.",
  "data": {
    "id": "dept-uuid",
    "name": "Cardiology",
    "description": "Heart and cardiovascular care"
  }
}
```

---

## Specialties

### Get All Specialties

Get list of all medical specialties.

**Endpoint:** `GET /specialties`

**Authentication:** None (Public)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "specialty-uuid",
      "name": "Interventional Cardiology",
      "description": "Minimally invasive heart procedures"
    }
  ]
}
```

---

### Create Specialty

Create new specialty (Admin only).

**Endpoint:** `POST /specialties`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Interventional Cardiology",
  "description": "Minimally invasive heart procedures"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Specialty created successfully.",
  "data": {
    "id": "specialty-uuid",
    "name": "Interventional Cardiology",
    "description": "Minimally invasive heart procedures"
  }
}
```

---

## Diagnostics

### Get All Diagnostics

Get list of all diagnostic tests.

**Endpoint:** `GET /diagnostics`

**Authentication:** None (Public)

**Query Parameters:**
- `category` (optional): Filter by category

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "diagnostic-uuid",
      "name": "Complete Blood Count (CBC)",
      "description": "Comprehensive blood analysis",
      "price": 500.00,
      "category": "Blood Tests"
    }
  ]
}
```

---

### Create Diagnostic

Create new diagnostic test (Admin only).

**Endpoint:** `POST /diagnostics`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Complete Blood Count (CBC)",
  "description": "Comprehensive blood analysis",
  "price": 500.00,
  "category": "Blood Tests"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Diagnostic created successfully.",
  "data": {
    "id": "diagnostic-uuid",
    "name": "Complete Blood Count (CBC)",
    "price": 500.00,
    "category": "Blood Tests"
  }
}
```

---

## Error Handling

All error responses follow this format:

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

### Example Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Authentication & Authorization

### JWT Token

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Token Expiration:** 24 hours (configurable)

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Administrator** | Full access to all endpoints |
| **Doctor** | Manage own appointments, view patients, update appointment status |
| **Patient** | Create appointments, view own data, update own profile |
| **Pathologist** | Manage lab reports, view patient reports |

### Example Protected Request

```bash
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production.

---

## File Uploads

File uploads (profile images, lab reports) use `multipart/form-data` encoding.

**Supported File Types:**
- Images: JPG, PNG, GIF
- Documents: PDF

**Maximum File Size:** 5MB

**Example File Upload:**
```bash
curl -X POST http://localhost:5001/api/lab-reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "patientId=patient-uuid" \
  -F "reportName=Blood Test" \
  -F "file=@/path/to/report.pdf"
```

---

## WebSocket Events (Socket.io)

The API includes real-time features via Socket.io on the same port.

**Connection:**
```javascript
const socket = io('http://localhost:5001');

// Join user room
socket.emit('join', userId);

// Listen for notifications
socket.on('notification', (data) => {
  console.log('New notification:', data);
});
```

**Events:**
- `appointment:created` - New appointment created
- `appointment:updated` - Appointment status changed
- `lab-report:ready` - Lab report completed

---

## Changelog

### Version 1.0.0 (2026-02-08)
- Initial API release
- Authentication and user management
- Doctor and patient management
- Appointment system
- Lab report management
- Location/branch/department hierarchy
- Specialty and diagnostic management

---

## Support

For API support or questions, contact the development team.

**Base URL:** `http://localhost:5001/api`

**Health Check:** `GET /api/health`
