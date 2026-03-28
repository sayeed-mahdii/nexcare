const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all lab reports
const getAllLabReports = async (req, res) => {
    try {
        const { status, patientId, labId, page = 1, limit = 10 } = req.query;

        const where = {};
        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (labId) where.labId = labId;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [reports, total] = await Promise.all([
            prisma.labReport.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    patient: {
                        include: {
                            user: {
                                select: { firstName: true, lastName: true, email: true },
                            },
                        },
                    },
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
            }),
            prisma.labReport.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                reports,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get lab reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lab reports.',
            error: error.message,
        });
    }
};

// Get lab report by ID
const getLabReportById = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await prisma.labReport.findUnique({
            where: { id },
            include: {
                patient: {
                    include: {
                        user: {
                            select: { firstName: true, lastName: true, email: true, phone: true },
                        },
                    },
                },
                lab: {
                    include: { branch: true },
                },
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
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Lab report not found.',
            });
        }

        res.json({
            success: true,
            data: report,
        });
    } catch (error) {
        console.error('Get lab report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lab report.',
            error: error.message,
        });
    }
};

// Create lab report (Pathologist only)
const createLabReport = async (req, res) => {
    try {
        const { patientId, labId, doctorId, reportName, reportDate, filePath, notes } = req.body;

        // Get pathologist record for current user
        const pathologist = await prisma.pathologist.findUnique({
            where: { userId: req.user.id },
        });

        if (!pathologist) {
            return res.status(403).json({
                success: false,
                message: 'Only pathologists can create lab reports.',
            });
        }

        const report = await prisma.labReport.create({
            data: {
                patientId,
                labId,
                pathologistId: pathologist.id,
                doctorId,
                reportName,
                reportDate: new Date(reportDate),
                filePath,
                notes,
                status: 'Pending',
            },
            include: {
                patient: {
                    include: {
                        user: {
                            select: { firstName: true, lastName: true },
                        },
                    },
                },
                lab: true,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Lab report created successfully.',
            data: report,
        });
    } catch (error) {
        console.error('Create lab report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create lab report.',
            error: error.message,
        });
    }
};

// Update lab report status
const updateLabReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, filePath } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;
        if (filePath) updateData.filePath = filePath;

        const report = await prisma.labReport.update({
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
            },
        });

        // Emit socket event when report is completed
        if (status === 'Completed') {
            const io = req.app.get('io');
            const patient = await prisma.patient.findUnique({
                where: { id: report.patientId },
                select: { userId: true },
            });

            if (io && patient) {
                io.to(patient.userId).emit('report:ready', {
                    message: 'Your lab report is ready',
                    report,
                });
            }
        }

        res.json({
            success: true,
            message: 'Lab report updated successfully.',
            data: report,
        });
    } catch (error) {
        console.error('Update lab report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update lab report.',
            error: error.message,
        });
    }
};

// Get pathologist dashboard
const getPathologistDashboard = async (req, res) => {
    try {
        const pathologist = await prisma.pathologist.findUnique({
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

        if (!pathologist) {
            return res.status(404).json({
                success: false,
                message: 'Pathologist profile not found.',
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
            pendingReports,
            completedToday,
            totalReports,
            recentReports,
        ] = await Promise.all([
            prisma.labReport.count({
                where: {
                    pathologistId: pathologist.id,
                    status: 'Pending',
                },
            }),
            prisma.labReport.count({
                where: {
                    pathologistId: pathologist.id,
                    status: 'Completed',
                    updatedAt: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            }),
            prisma.labReport.count({
                where: { pathologistId: pathologist.id },
            }),
            prisma.labReport.findMany({
                where: { pathologistId: pathologist.id },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    patient: {
                        include: {
                            user: {
                                select: { firstName: true, lastName: true },
                            },
                        },
                    },
                    lab: true,
                },
            }),
        ]);

        res.json({
            success: true,
            data: {
                user: pathologist.user,
                stats: {
                    pendingReports,
                    completedToday,
                    totalReports,
                },
                recentReports,
            },
        });
    } catch (error) {
        console.error('Get pathologist dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data.',
            error: error.message,
        });
    }
};

module.exports = {
    getAllLabReports,
    getLabReportById,
    createLabReport,
    updateLabReport,
    getPathologistDashboard,
};
