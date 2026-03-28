require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const branchRoutes = require('./routes/branches');
const departmentRoutes = require('./routes/departments');
const labReportRoutes = require('./routes/labReports');
const laboratoryRoutes = require('./routes/laboratories');
const specialtyRoutes = require('./routes/specialties');
const locationRoutes = require('./routes/locations');
const diagnosticRoutes = require('./routes/diagnostics');
const testRoutes = require('./routes/tests');
const testOrderRoutes = require('./routes/testOrders');
const ratingRoutes = require('./routes/ratingRoutes');

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

// Make io accessible in routes
app.set('io', io);
app.set('prisma', prisma);

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/lab-reports', labReportRoutes);
app.use('/api/laboratories', laboratoryRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/diagnostics', diagnosticRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/test-orders', testOrderRoutes);
app.use('/api/ratings', ratingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'NEXCARE API is running' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // Join room based on user role and id
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${socket.id} joined room: ${userId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('🔌 User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏥 NEXCARE Healthcare System API                        ║
║   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   ║
║   Server running on: http://localhost:${PORT}               ║
║   Socket.io enabled                                       ║
║   Database: MySQL via Prisma                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
