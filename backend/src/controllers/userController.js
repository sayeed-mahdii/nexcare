const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 10 } = req.query;

        const where = {};

        if (role) {
            where.role = role;
        }

        if (search) {
            where.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: parseInt(limit),
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    gender: true,
                    phone: true,
                    profileImage: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users.',
            error: error.message,
        });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                doctor: {
                    include: {
                        department: true,
                        specialties: {
                            include: { specialty: true },
                        },
                    },
                },
                patient: true,
                pathologist: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            data: userWithoutPassword,
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user.',
            error: error.message,
        });
    }
};

// Create user (Admin only)
const createUser = async (req, res) => {
    try {
        const { email, password, firstName, lastName, role, gender, phone, ...additionalData } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered.',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role,
                gender,
                phone,
            },
        });

        // Create role-specific profile
        if (role === 'Doctor' && additionalData.departmentId) {
            await prisma.doctor.create({
                data: {
                    userId: user.id,
                    qualification: additionalData.qualification || 'MBBS',
                    experienceYears: additionalData.experienceYears || 0,
                    departmentId: additionalData.departmentId,
                },
            });
        } else if (role === 'Patient') {
            await prisma.patient.create({
                data: {
                    userId: user.id,
                    medicalHistory: additionalData.medicalHistory || null,
                },
            });
        } else if (role === 'Pathologist') {
            await prisma.pathologist.create({
                data: {
                    userId: user.id,
                    qualification: additionalData.qualification || 'MBBS',
                    specialization: additionalData.specialization || 'General',
                },
            });
        }

        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json({
            success: true,
            message: 'User created successfully.',
            data: userWithoutPassword,
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user.',
            error: error.message,
        });
    }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, phone, role, gender, profileImage } = req.body;

        const user = await prisma.user.update({
            where: { id },
            data: {
                firstName,
                lastName,
                phone,
                gender,
                profileImage,
            },
        });

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'User updated successfully.',
            data: userWithoutPassword,
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user.',
            error: error.message,
        });
    }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent self-deletion
        if (id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account.',
            });
        }

        await prisma.user.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'User deleted successfully.',
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user.',
            error: error.message,
        });
    }
};

// Get dashboard stats (Admin only)
const getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalDoctors,
            totalPatients,
            totalLabReports,
            totalPathologists,
            totalGuestBookings,
            pendingGuestBookings,
            confirmedGuestBookings,
            completedGuestBookings,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'Doctor' } }),
            prisma.user.count({ where: { role: 'Patient' } }),
            prisma.labReport.count(),
            prisma.user.count({ where: { role: 'Pathologist' } }),
            prisma.guestBooking.count(),
            prisma.guestBooking.count({ where: { status: 'Pending' } }),
            prisma.guestBooking.count({ where: { status: 'Approved' } }),
            prisma.guestBooking.count({ where: { status: 'Completed' } }),
        ]);

        // Recent guest bookings
        const recentBookings = await prisma.guestBooking.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                branch: true,
                items: {
                    include: {
                        test: true,
                    },
                },
            },
        });

        const statsData = {
            totalUsers,
            totalDoctors,
            totalPatients,
            totalAppointments: totalGuestBookings,
            pendingAppointments: pendingGuestBookings,
            completedAppointments: completedGuestBookings,
            totalLabReports,
            totalPathologists,
            totalGuestBookings,
            pendingGuestBookings,
            confirmedGuestBookings,
        };

        console.log('Dashboard Stats Calculated:', statsData);

        res.json({
            success: true,
            data: {
                stats: statsData,
                recentBookings,
                lastUpdated: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats.',
            error: error.message,
        });
    }
};

// Upload profile image
const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided.',
            });
        }

        const userId = req.user.id; // From auth middleware
        const profileImage = `/uploads/${req.file.filename}`;

        const user = await prisma.user.update({
            where: { id: userId },
            data: { profileImage },
        });

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Profile image uploaded successfully.',
            data: {
                user: userWithoutPassword,
                profileImage,
            },
        });
    } catch (error) {
        console.error('Upload profile image error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload profile image.',
            error: error.message,
        });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both current and new passwords.',
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect current password.',
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.json({
            success: true,
            message: 'Password changed successfully.',
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password.',
            error: error.message,
        });
    }
};

// Get notifications (Admin & Doctor)
const getNotifications = async (req, res) => {
    try {
        const { role, id: userId } = req.user;
        const notifications = [];

        if (role === 'Administrator') {
            const [pendingGuestBookingsCount, pendingDoctorsCount] = await Promise.all([
                prisma.guestBooking.count({ where: { status: 'Pending' } }),
                prisma.doctor.count({ where: { isApproved: false } })
            ]);

            if (pendingGuestBookingsCount > 0) {
                notifications.push({
                    type: 'booking',
                    message: `${pendingGuestBookingsCount} new guest booking(s) pending approval`,
                    count: pendingGuestBookingsCount,
                    link: '/admin/guest-bookings?status=Pending',
                    priority: 'urgent'
                });
            }

            if (pendingDoctorsCount > 0) {
                notifications.push({
                    type: 'doctor',
                    message: `${pendingDoctorsCount} doctor request(s) pending approval`,
                    count: pendingDoctorsCount,
                    link: '/admin/pending-doctors',
                    priority: 'urgent'
                });
            }
        } else if (role === 'Doctor') {
            // Find doctor profile
            const doctor = await prisma.doctor.findUnique({
                where: { userId }
            });

            if (doctor) {
                // Get appointments created in the last 24 hours
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                const newAppointmentsCount = await prisma.appointment.count({
                    where: {
                        doctorId: doctor.id,
                        status: 'Scheduled',
                        createdAt: {
                            gte: yesterday
                        }
                    }
                });

                if (newAppointmentsCount > 0) {
                    notifications.push({
                        type: 'appointment',
                        message: `${newAppointmentsCount} new appointment(s) booked recently`,
                        count: newAppointmentsCount,
                        link: '/doctor/appointments',
                        priority: 'high' // Blue/Normal priority
                    });
                }
            }
        }

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
        });
    }
};

// Get all pathologists (for doctor dropdown)
const getAllPathologists = async (req, res) => {
    try {
        const pathologists = await prisma.pathologist.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profileImage: true,
                    },
                },
            },
            orderBy: {
                user: { firstName: 'asc' },
            },
        });

        res.json({
            success: true,
            data: pathologists,
        });
    } catch (error) {
        console.error('Get pathologists error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pathologists',
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getDashboardStats,
    uploadProfileImage,
    changePassword,
    getNotifications,
    getAllPathologists,
};