const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create test order (Doctor)
const createTestOrder = async (req, res) => {
    try {
        const { appointmentId, testId, clinicalNote, priority } = req.body;

        // Verify appointment exists and belongs to this doctor
        const doctor = await prisma.doctor.findUnique({
            where: { userId: req.user.id },
        });

        if (!doctor) {
            return res.status(403).json({
                success: false,
                message: 'Doctor profile not found.',
            });
        }

        const appointment = await prisma.appointment.findFirst({
            where: {
                id: appointmentId,
                doctorId: doctor.id,
            },
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found or not authorized.',
            });
        }

        // Check if test order already exists
        const existingOrder = await prisma.testOrder.findFirst({
            where: { appointmentId, testId },
        });

        if (existingOrder) {
            return res.status(400).json({
                success: false,
                message: 'Test already ordered for this appointment.',
            });
        }

        const testOrder = await prisma.testOrder.create({
            data: {
                appointmentId,
                testId,
                clinicalNote,
                priority: priority || 'Normal',
                status: 'ORDERED',
            },
            include: {
                test: true,
                appointment: {
                    include: {
                        patient: {
                            include: { user: true },
                        },
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: 'Test ordered successfully.',
            data: testOrder,
        });
    } catch (error) {
        console.error('Create test order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create test order.',
            error: error.message,
        });
    }
};

// Create multiple test orders at once (Doctor)
const createBulkTestOrders = async (req, res) => {
    try {
        const { appointmentId, pathologistId, tests } = req.body; // tests = [{ testId, clinicalNote, priority }]

        // Verify appointment belongs to this doctor
        const doctor = await prisma.doctor.findUnique({
            where: { userId: req.user.id },
        });

        if (!doctor) {
            return res.status(403).json({
                success: false,
                message: 'Doctor profile not found.',
            });
        }

        const appointment = await prisma.appointment.findFirst({
            where: {
                id: appointmentId,
                doctorId: doctor.id,
            },
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found or not authorized.',
            });
        }

        // Verify pathologist exists if provided
        if (pathologistId) {
            const pathologist = await prisma.pathologist.findUnique({
                where: { id: pathologistId },
            });
            if (!pathologist) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected pathologist not found.',
                });
            }
        }

        // Create all test orders
        const createdOrders = await prisma.$transaction(
            tests.map(test =>
                prisma.testOrder.create({
                    data: {
                        appointmentId,
                        testId: test.testId,
                        assignedPathologistId: pathologistId || null,
                        clinicalNote: test.clinicalNote || null,
                        priority: test.priority || 'Normal',
                        status: 'ORDERED',
                    },
                })
            )
        );

        res.status(201).json({
            success: true,
            message: `${createdOrders.length} tests ordered successfully.`,
            data: createdOrders,
        });
    } catch (error) {
        console.error('Create bulk test orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create test orders.',
            error: error.message,
        });
    }
};

// Get test orders for an appointment (Doctor)
const getAppointmentTestOrders = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const testOrders = await prisma.testOrder.findMany({
            where: { appointmentId },
            include: {
                test: true,
                testResult: {
                    include: {
                        verifiedBy: {
                            include: { user: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: testOrders,
        });
    } catch (error) {
        console.error('Get appointment test orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch test orders.',
            error: error.message,
        });
    }
};

// Get pending test orders (Pathologist - only shows tests assigned to them)
const getPendingTestOrders = async (req, res) => {
    try {
        const { status = 'ORDERED' } = req.query;

        // Get pathologist
        const pathologist = await prisma.pathologist.findUnique({
            where: { userId: req.user.id },
        });

        if (!pathologist) {
            return res.status(403).json({
                success: false,
                message: 'Pathologist profile not found.',
            });
        }

        const testOrders = await prisma.testOrder.findMany({
            where: {
                status,
                assignedPathologistId: pathologist.id,
                test: { requiresPathologist: true },
            },
            include: {
                test: true,
                appointment: {
                    include: {
                        patient: {
                            include: { user: true },
                        },
                        doctor: {
                            include: { user: true },
                        },
                    },
                },
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'asc' },
            ],
        });

        res.json({
            success: true,
            data: testOrders,
        });
    } catch (error) {
        console.error('Get pending test orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending test orders.',
            error: error.message,
        });
    }
};

// Submit test result (Pathologist)
const submitTestResult = async (req, res) => {
    try {
        const { id } = req.params;
        const { resultData, impression } = req.body;

        // Get pathologist
        const pathologist = await prisma.pathologist.findUnique({
            where: { userId: req.user.id },
        });

        if (!pathologist) {
            return res.status(403).json({
                success: false,
                message: 'Pathologist profile not found.',
            });
        }

        // Check test order exists
        const testOrder = await prisma.testOrder.findUnique({
            where: { id },
        });

        if (!testOrder) {
            return res.status(404).json({
                success: false,
                message: 'Test order not found.',
            });
        }

        // Create or update test result
        const testResult = await prisma.testResult.upsert({
            where: { testOrderId: id },
            create: {
                testOrderId: id,
                resultData,
                impression,
                verifiedById: pathologist.id,
                verifiedAt: new Date(),
            },
            update: {
                resultData,
                impression,
                verifiedById: pathologist.id,
                verifiedAt: new Date(),
            },
        });

        // Update test order status
        await prisma.testOrder.update({
            where: { id },
            data: { status: 'PATHOLOGIST_VERIFIED' },
        });

        res.json({
            success: true,
            message: 'Test result submitted successfully.',
            data: testResult,
        });
    } catch (error) {
        console.error('Submit test result error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit test result.',
            error: error.message,
        });
    }
};

// Update test order status (Doctor/Pathologist)
const updateTestOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['ORDERED', 'IN_PROGRESS', 'PATHOLOGIST_VERIFIED', 'DOCTOR_VERIFIED', 'DELIVERED'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status.',
            });
        }

        const testOrder = await prisma.testOrder.update({
            where: { id },
            data: { status },
            include: {
                test: true,
                testResult: true,
            },
        });

        res.json({
            success: true,
            message: 'Test order status updated.',
            data: testOrder,
        });
    } catch (error) {
        console.error('Update test order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update test order status.',
            error: error.message,
        });
    }
};

// Doctor verifies test result
const doctorVerifyResult = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify doctor
        const doctor = await prisma.doctor.findUnique({
            where: { userId: req.user.id },
        });

        if (!doctor) {
            return res.status(403).json({
                success: false,
                message: 'Doctor profile not found.',
            });
        }

        // Check test order belongs to this doctor's appointment
        const testOrder = await prisma.testOrder.findFirst({
            where: {
                id,
                appointment: { doctorId: doctor.id },
                status: 'PATHOLOGIST_VERIFIED',
            },
        });

        if (!testOrder) {
            return res.status(404).json({
                success: false,
                message: 'Test order not found or not ready for verification.',
            });
        }

        await prisma.testOrder.update({
            where: { id },
            data: { status: 'DOCTOR_VERIFIED' },
        });

        res.json({
            success: true,
            message: 'Test result verified by doctor.',
        });
    } catch (error) {
        console.error('Doctor verify result error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify test result.',
            error: error.message,
        });
    }
};

// Get test orders pending doctor verification (or verified if status param provided)
const getPendingDoctorVerification = async (req, res) => {
    try {
        const { status = 'PATHOLOGIST_VERIFIED' } = req.query;

        const doctor = await prisma.doctor.findUnique({
            where: { userId: req.user.id },
        });

        if (!doctor) {
            return res.status(403).json({
                success: false,
                message: 'Doctor profile not found.',
            });
        }

        const testOrders = await prisma.testOrder.findMany({
            where: {
                status: status,
                appointment: { doctorId: doctor.id },
            },
            include: {
                test: true,
                testResult: {
                    include: {
                        verifiedBy: {
                            include: { user: true },
                        },
                    },
                },
                appointment: {
                    include: {
                        patient: {
                            include: { user: true },
                        },
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        res.json({
            success: true,
            data: testOrders,
        });
    } catch (error) {
        console.error('Get pending doctor verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending verifications.',
            error: error.message,
        });
    }
};

// Get patient's verified test results (Patient)
const getPatientTestResults = async (req, res) => {
    try {
        // Get patient
        const patient = await prisma.patient.findUnique({
            where: { userId: req.user.id },
        });

        if (!patient) {
            return res.status(403).json({
                success: false,
                message: 'Patient profile not found.',
            });
        }

        const testOrders = await prisma.testOrder.findMany({
            where: {
                status: 'DOCTOR_VERIFIED',
                appointment: { patientId: patient.id },
            },
            include: {
                test: true,
                testResult: {
                    include: {
                        verifiedBy: {
                            include: { user: true },
                        },
                    },
                },
                appointment: {
                    include: {
                        doctor: {
                            include: { user: true },
                        },
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        res.json({
            success: true,
            data: testOrders,
        });
    } catch (error) {
        console.error('Get patient test results error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch test results.',
            error: error.message,
        });
    }
};

module.exports = {
    createTestOrder,
    createBulkTestOrders,
    getAppointmentTestOrders,
    getPendingTestOrders,
    submitTestResult,
    updateTestOrderStatus,
    doctorVerifyResult,
    getPendingDoctorVerification,
    getPatientTestResults,
};
