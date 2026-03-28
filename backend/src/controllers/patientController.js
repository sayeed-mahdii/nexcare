const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all patients
// For Administrators: returns all patients
// For Doctors: returns only patients who have appointments with that doctor
const getAllPatients = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const userRole = req.user.role;
        const userId = req.user.id;

        let where = {};
        let patientIds = null;

        // If user is a Doctor, only show patients who have appointments with them
        if (userRole === 'Doctor') {
            // First, get the doctor record for the current user
            const doctor = await prisma.doctor.findUnique({
                where: { userId },
            });

            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor profile not found.',
                });
            }

            // Get unique patient IDs from appointments with this doctor
            const appointments = await prisma.appointment.findMany({
                where: { doctorId: doctor.id },
                select: { patientId: true },
                distinct: ['patientId'],
            });

            patientIds = appointments.map((apt) => apt.patientId);

            // If no patients have appointments with this doctor, return empty
            if (patientIds.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        patients: [],
                        pagination: {
                            total: 0,
                            page: parseInt(page),
                            limit: parseInt(limit),
                            totalPages: 0,
                        },
                    },
                });
            }

            where.id = { in: patientIds };
        }

        if (search) {
            where.user = {
                OR: [
                    { firstName: { contains: search } },
                    { lastName: { contains: search } },
                    { email: { contains: search } },
                ],
            };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [patients, total] = await Promise.all([
            prisma.patient.findMany({
                where,
                skip,
                take: parseInt(limit),
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
                            createdAt: true,
                        },
                    },
                    _count: {
                        select: {
                            appointments: true,
                            labReports: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.patient.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                patients,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch patients.',
            error: error.message,
        });
    }
};

// Get patient by ID
// For Administrators: can access any patient
// For Doctors: can only access patients who have appointments with them
const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;
        const userId = req.user.id;

        // If user is a Doctor, verify they have an appointment with this patient
        if (userRole === 'Doctor') {
            const doctor = await prisma.doctor.findUnique({
                where: { userId },
            });

            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor profile not found.',
                });
            }

            // Check if this doctor has any appointments with the requested patient
            const hasAppointment = await prisma.appointment.findFirst({
                where: {
                    doctorId: doctor.id,
                    patientId: id,
                },
            });

            if (!hasAppointment) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have access to this patient\'s records.',
                });
            }
        }

        const patient = await prisma.patient.findUnique({
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
                        createdAt: true,
                    },
                },
                appointments: {
                    take: 10,
                    orderBy: { appointmentDate: 'desc' },
                    include: {
                        doctor: {
                            include: {
                                user: {
                                    select: { firstName: true, lastName: true },
                                },
                                department: true,
                            },
                        },
                        branch: true,
                    },
                },
                labReports: {
                    take: 10,
                    orderBy: { reportDate: 'desc' },
                    include: {
                        lab: true,
                        pathologist: {
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

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found.',
            });
        }

        res.json({
            success: true,
            data: patient,
        });
    } catch (error) {
        console.error('Get patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch patient.',
            error: error.message,
        });
    }
};

// Update patient medical history
// For Administrators: can update any patient
// For Doctors: can only update patients who have appointments with them
const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { medicalHistory } = req.body;
        const userRole = req.user.role;
        const userId = req.user.id;

        // If user is a Doctor, verify they have an appointment with this patient
        if (userRole === 'Doctor') {
            const doctor = await prisma.doctor.findUnique({
                where: { userId },
            });

            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor profile not found.',
                });
            }

            // Check if this doctor has any appointments with the requested patient
            const hasAppointment = await prisma.appointment.findFirst({
                where: {
                    doctorId: doctor.id,
                    patientId: id,
                },
            });

            if (!hasAppointment) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to update this patient\'s records.',
                });
            }
        }

        const patient = await prisma.patient.update({
            where: { id },
            data: { medicalHistory },
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

        res.json({
            success: true,
            message: 'Patient updated successfully.',
            data: patient,
        });
    } catch (error) {
        console.error('Update patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update patient.',
            error: error.message,
        });
    }
};

// Get patient dashboard
const getPatientDashboard = async (req, res) => {
    try {
        const patient = await prisma.patient.findUnique({
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

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found.',
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            upcomingAppointments,
            totalAppointments,
            totalReports,
            recentReports,
        ] = await Promise.all([
            prisma.appointment.findMany({
                where: {
                    patientId: patient.id,
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
                    doctor: {
                        include: {
                            user: {
                                select: { firstName: true, lastName: true, profileImage: true },
                            },
                            department: true,
                        },
                    },
                    branch: true,
                },
            }),
            prisma.appointment.count({
                where: { patientId: patient.id },
            }),
            prisma.labReport.count({
                where: { patientId: patient.id },
            }),
            prisma.labReport.findMany({
                where: { patientId: patient.id },
                take: 3,
                orderBy: { reportDate: 'desc' },
                include: {
                    lab: true,
                },
            }),
        ]);

        res.json({
            success: true,
            data: {
                user: patient.user,
                stats: {
                    upcomingAppointmentsCount: upcomingAppointments.length,
                    totalAppointments,
                    totalReports,
                },
                upcomingAppointments,
                recentReports,
                medicalHistory: patient.medicalHistory,
            },
        });
    } catch (error) {
        console.error('Get patient dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data.',
            error: error.message,
        });
    }
};

// Get patient's appointments
const getPatientAppointments = async (req, res) => {
    try {
        const patient = await prisma.patient.findUnique({
            where: { userId: req.user.id },
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found.',
            });
        }

        const { status } = req.query;
        const where = { patientId: patient.id };

        if (status) {
            where.status = status;
        }

        const appointments = await prisma.appointment.findMany({
            where,
            include: {
                doctor: {
                    include: {
                        user: {
                            select: { firstName: true, lastName: true, profileImage: true },
                        },
                        department: true,
                    },
                },
                branch: {
                    include: { location: true },
                },
                rating: true,
            },
            orderBy: { appointmentDate: 'desc' },
        });

        res.json({
            success: true,
            data: appointments,
        });
    } catch (error) {
        console.error('Get patient appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointments.',
            error: error.message,
        });
    }
};

// Get patient's lab reports
const getPatientLabReports = async (req, res) => {
    try {
        const patient = await prisma.patient.findUnique({
            where: { userId: req.user.id },
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found.',
            });
        }

        const reports = await prisma.labReport.findMany({
            where: { patientId: patient.id },
            include: {
                lab: true,
                pathologist: {
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
            orderBy: { reportDate: 'desc' },
        });

        res.json({
            success: true,
            data: reports,
        });
    } catch (error) {
        console.error('Get patient lab reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lab reports.',
            error: error.message,
        });
    }
};

module.exports = {
    getAllPatients,
    getPatientById,
    updatePatient,
    getPatientDashboard,
    getPatientAppointments,
    getPatientLabReports,
};
