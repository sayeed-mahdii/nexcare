const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all doctors
const getAllDoctors = async (req, res) => {
    try {
        const { departmentId, branchId, specialtyId, search, status } = req.query;

        const where = {};

        // Only filter by isApproved if status is not 'all'
        // This allows admins (or managing pages) to see pending/rejected doctors
        if (status !== 'all') {
            where.isApproved = true;
        }

        if (departmentId) {
            where.departmentId = departmentId;
        }

        if (branchId) {
            where.department = {
                branchId: branchId,
            };
        }

        if (specialtyId) {
            where.specialties = {
                some: {
                    specialtyId: specialtyId,
                },
            };
        }

        if (search) {
            where.user = {
                OR: [
                    { firstName: { contains: search } },
                    { lastName: { contains: search } },
                ],
            };
        }

        const doctors = await prisma.doctor.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        gender: true,
                        profileImage: true,
                    },
                },
                department: {
                    include: {
                        branch: true,
                    },
                },
                specialties: {
                    include: {
                        specialty: true,
                    },
                },
            },
            orderBy: {
                user: {
                    firstName: 'asc',
                },
            },
        });

        res.json({
            success: true,
            data: doctors,
        });
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch doctors.',
            error: error.message,
        });
    }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await prisma.doctor.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        gender: true,
                        profileImage: true,
                    },
                },
                department: {
                    include: {
                        branch: {
                            include: {
                                location: true,
                            },
                        },
                    },
                },
                specialties: {
                    include: {
                        specialty: true,
                    },
                },
                appointments: {
                    where: {
                        appointmentDate: {
                            gte: new Date(),
                        },
                    },
                    take: 10,
                    orderBy: {
                        appointmentDate: 'asc',
                    },
                    include: {
                        patient: {
                            include: {
                                user: {
                                    select: { firstName: true, lastName: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found.',
            });
        }

        res.json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        console.error('Get doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch doctor.',
            error: error.message,
        });
    }
};

// Get doctor's appointments
const getDoctorAppointments = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, date } = req.query;

        const where = { doctorId: id };

        if (status) {
            where.status = status;
        }

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);

            where.appointmentDate = {
                gte: startDate,
                lt: endDate,
            };
        }

        const appointments = await prisma.appointment.findMany({
            where,
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
                branch: true,
            },
            orderBy: [
                { appointmentDate: 'asc' },
                { appointmentTime: 'asc' },
            ],
        });

        res.json({
            success: true,
            data: appointments,
        });
    } catch (error) {
        console.error('Get doctor appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointments.',
            error: error.message,
        });
    }
};

// Update doctor
const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { qualification, experienceYears, departmentId, specialtyIds } = req.body;

        const doctor = await prisma.doctor.update({
            where: { id },
            data: {
                qualification,
                experienceYears,
                departmentId,
            },
        });

        // Update specialties if provided
        if (specialtyIds && Array.isArray(specialtyIds)) {
            await prisma.doctorSpecialty.deleteMany({
                where: { doctorId: id },
            });

            await prisma.doctorSpecialty.createMany({
                data: specialtyIds.map((specialtyId) => ({
                    doctorId: id,
                    specialtyId,
                })),
            });
        }

        const updatedDoctor = await prisma.doctor.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                department: true,
                specialties: {
                    include: { specialty: true },
                },
            },
        });

        res.json({
            success: true,
            message: 'Doctor updated successfully.',
            data: updatedDoctor,
        });
    } catch (error) {
        console.error('Update doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update doctor.',
            error: error.message,
        });
    }
};

// Get doctor dashboard stats
const getDoctorDashboard = async (req, res) => {
    try {
        // First get the doctor record for the logged-in user
        const doctor = await prisma.doctor.findUnique({
            where: { userId: req.user.id },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        profileImage: true,
                    },
                },
            },
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found.',
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
            totalPatients,
            todayAppointments,
            upcomingAppointments,
            completedToday,
            recentAppointments,
        ] = await Promise.all([
            prisma.appointment.groupBy({
                by: ['patientId'],
                where: { doctorId: doctor.id },
            }).then((r) => r.length),
            prisma.appointment.count({
                where: {
                    doctorId: doctor.id,
                    appointmentDate: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            }),
            prisma.appointment.findMany({
                where: {
                    doctorId: doctor.id,
                    appointmentDate: {
                        gte: today,
                    },
                    status: 'Scheduled',
                },
                take: 5,
                orderBy: [
                    { appointmentDate: 'asc' },
                    { appointmentTime: 'asc' },
                ],
                include: {
                    patient: {
                        include: {
                            user: {
                                select: { firstName: true, lastName: true, phone: true },
                            },
                        },
                    },
                },
            }),
            prisma.appointment.count({
                where: {
                    doctorId: doctor.id,
                    appointmentDate: {
                        gte: today,
                        lt: tomorrow,
                    },
                    status: 'Completed',
                },
            }),
            // Recent appointments (today and previous days)
            prisma.appointment.findMany({
                where: {
                    doctorId: doctor.id,
                    appointmentDate: {
                        lte: tomorrow, // Today and before
                    },
                },
                take: 10,
                orderBy: [
                    { appointmentDate: 'desc' },
                    { appointmentTime: 'desc' },
                ],
                include: {
                    patient: {
                        include: {
                            user: {
                                select: { firstName: true, lastName: true, phone: true, email: true },
                            },
                        },
                    },
                },
            }),
        ]);

        res.json({
            success: true,
            data: {
                user: doctor.user,
                stats: {
                    totalPatients,
                    todayAppointments,
                    completedToday,
                },
                upcomingAppointments,
                recentAppointments,
            },
        });
    } catch (error) {
        console.error('Get doctor dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data.',
            error: error.message,
        });
    }
};

// Get pending doctors (Admin only)
const getPendingDoctors = async (req, res) => {
    try {
        const pendingDoctors = await prisma.doctor.findMany({
            where: {
                isApproved: false,
                rejectedReason: null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        gender: true,
                        createdAt: true,
                    },
                },
                department: {
                    include: {
                        branch: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: pendingDoctors,
            count: pendingDoctors.length,
        });
    } catch (error) {
        console.error('Get pending doctors error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending doctors.',
            error: error.message,
        });
    }
};

// Approve doctor (Admin only)
const approveDoctor = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await prisma.doctor.update({
            where: { id },
            data: {
                isApproved: true,
                approvedAt: new Date(),
                rejectedReason: null,
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        // Emit socket notification to the doctor
        const io = req.app.get('io');
        if (io) {
            io.to(doctor.userId).emit('doctor:approved', {
                message: 'Your doctor account has been approved!',
            });
        }

        res.json({
            success: true,
            message: `Dr. ${doctor.user.firstName} ${doctor.user.lastName} has been approved.`,
            data: doctor,
        });
    } catch (error) {
        console.error('Approve doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve doctor.',
            error: error.message,
        });
    }
};

// Reject doctor (Admin only)
const rejectDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required.',
            });
        }

        const doctor = await prisma.doctor.update({
            where: { id },
            data: {
                isApproved: false,
                rejectedReason: reason,
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        // Emit socket notification to the doctor
        const io = req.app.get('io');
        if (io) {
            io.to(doctor.userId).emit('doctor:rejected', {
                message: 'Your doctor application has been rejected.',
                reason,
            });
        }

        res.json({
            success: true,
            message: `Dr. ${doctor.user.firstName} ${doctor.user.lastName}'s application has been rejected.`,
            data: doctor,
        });
    } catch (error) {
        console.error('Reject doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject doctor.',
            error: error.message,
        });
    }
};

// Delete doctor (Admin only)
const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if doctor exists
        const doctor = await prisma.doctor.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found.'
            });
        }

        // Delete related records first to avoid foreign key constraints

        // 1. Delete doctor specialties
        await prisma.doctorSpecialty.deleteMany({
            where: { doctorId: id }
        });

        // 2. Delete all appointments for this doctor
        await prisma.appointment.deleteMany({
            where: { doctorId: id }
        });

        // 3. Nullify doctorId in lab reports (doctor is optional in labReports)
        await prisma.labReport.updateMany({
            where: { doctorId: id },
            data: { doctorId: null }
        });

        // Delete the doctor record
        await prisma.doctor.delete({
            where: { id }
        });

        // Also delete the associated user account
        await prisma.user.delete({
            where: { id: doctor.userId }
        });

        res.json({
            success: true,
            message: 'Doctor deleted successfully.'
        });
    } catch (error) {
        console.error('Delete doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete doctor.',
            error: error.message
        });
    }
};

module.exports = {
    getAllDoctors,
    getDoctorById,
    getDoctorAppointments,
    updateDoctor,
    getDoctorDashboard,
    getPendingDoctors,
    approveDoctor,
    rejectDoctor,
    deleteDoctor,
};
