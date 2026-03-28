const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all appointments
const getAllAppointments = async (req, res) => {
    try {
        const { status, doctorId, patientId, branchId, date, page = 1, limit = 10 } = req.query;

        const where = {};

        if (status) where.status = status;
        if (doctorId) where.doctorId = doctorId;
        if (patientId) where.patientId = patientId;
        if (branchId) where.branchId = branchId;

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            where.appointmentDate = {
                gte: startDate,
                lt: endDate,
            };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    patient: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                    gender: true,
                                },
                            },
                        },
                    },
                    doctor: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    profileImage: true,
                                },
                            },
                            department: true,
                        },
                    },
                    branch: {
                        include: { location: true },
                    },
                },
                orderBy: [
                    { appointmentDate: 'desc' },
                    { appointmentTime: 'asc' },
                ],
            }),
            prisma.appointment.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                appointments,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointments.',
            error: error.message,
        });
    }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                                gender: true,
                            },
                        },
                    },
                },
                doctor: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                profileImage: true,
                            },
                        },
                        department: true,
                        specialties: {
                            include: { specialty: true },
                        },
                    },
                },
                branch: {
                    include: { location: true },
                },
            },
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found.',
            });
        }

        res.json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointment.',
            error: error.message,
        });
    }
};

// Create appointment
const createAppointment = async (req, res) => {
    try {
        const { doctorId, branchId, appointmentDate, appointmentTime, notes } = req.body;

        // Get patient record for current user
        let patient = await prisma.patient.findUnique({
            where: { userId: req.user.id },
        });

        // If patient profile doesn't exist, create one
        if (!patient) {
            patient = await prisma.patient.create({
                data: {
                    userId: req.user.id,
                },
            });
        }

        // Check for conflicting appointment
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                doctorId,
                appointmentDate: new Date(appointmentDate),
                appointmentTime,
                status: 'Scheduled',
            },
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked. Please choose another time.',
            });
        }

        const appointment = await prisma.appointment.create({
            data: {
                patientId: patient.id,
                doctorId,
                branchId,
                appointmentDate: new Date(appointmentDate),
                appointmentTime,
                notes,
                status: 'Scheduled',
            },
            include: {
                doctor: {
                    include: {
                        user: {
                            select: { firstName: true, lastName: true },
                        },
                    },
                },
                branch: true,
            },
        });

        // Emit socket event for real-time notification
        const io = req.app.get('io');
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
            select: { userId: true },
        });

        if (io && doctor) {
            io.to(doctor.userId).emit('appointment:new', {
                message: 'New appointment booked',
                appointment,
            });
        }

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully.',
            data: appointment,
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create appointment.',
            error: error.message,
        });
    }
};

// Update appointment status
const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, appointmentDate, appointmentTime } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;
        if (appointmentDate) updateData.appointmentDate = new Date(appointmentDate);
        if (appointmentTime) updateData.appointmentTime = appointmentTime;

        const appointment = await prisma.appointment.update({
            where: { id },
            data: updateData,
            include: {
                patient: {
                    include: {
                        user: {
                            select: { firstName: true, lastName: true },
                        },
                    },
                },
                doctor: {
                    include: {
                        user: {
                            select: { firstName: true, lastName: true },
                        },
                    },
                },
            },
        });

        // Emit socket event for status update
        const io = req.app.get('io');
        const patient = await prisma.patient.findUnique({
            where: { id: appointment.patientId },
            select: { userId: true },
        });

        if (io && patient) {
            io.to(patient.userId).emit('appointment:status', {
                message: `Appointment status updated to ${status}`,
                appointment,
            });
        }

        res.json({
            success: true,
            message: 'Appointment updated successfully.',
            data: appointment,
        });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update appointment.',
            error: error.message,
        });
    }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await prisma.appointment.update({
            where: { id },
            data: { status: 'Cancelled' },
        });

        res.json({
            success: true,
            message: 'Appointment cancelled successfully.',
            data: appointment,
        });
    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel appointment.',
            error: error.message,
        });
    }
};

// Get available time slots for a doctor on a specific date
const getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId || !date) {
            return res.status(400).json({
                success: false,
                message: 'Doctor ID and date are required.',
            });
        }

        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        // Get booked slots
        const bookedAppointments = await prisma.appointment.findMany({
            where: {
                doctorId,
                appointmentDate: {
                    gte: startDate,
                    lt: endDate,
                },
                status: 'Scheduled',
            },
            select: { appointmentTime: true },
        });

        const bookedTimes = bookedAppointments.map((a) => a.appointmentTime);

        // Define all available time slots
        const allSlots = [
            '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
            '04:30 PM', '05:00 PM',
        ];

        // Filter out booked slots
        const availableSlots = allSlots.filter((slot) => !bookedTimes.includes(slot));

        res.json({
            success: true,
            data: {
                date,
                doctorId,
                availableSlots,
                bookedSlots: bookedTimes,
            },
        });
    } catch (error) {
        console.error('Get available slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available slots.',
            error: error.message,
        });
    }
};

module.exports = {
    getAllAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getAvailableSlots,
};
