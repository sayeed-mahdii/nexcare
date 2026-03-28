const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Submit a rating for a completed appointment
const submitRating = async (req, res) => {
    try {
        const { appointmentId, rating, feedback } = req.body;

        // Get patient from user ID
        const patient = await prisma.patient.findUnique({
            where: { userId: req.user.id },
        });

        if (!patient) {
            return res.status(403).json({
                success: false,
                message: 'Only patients can submit ratings',
            });
        }

        if (!appointmentId || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Appointment ID and rating are required',
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5',
            });
        }

        // Verify the appointment exists, belongs to this patient, and is completed
        const appointment = await prisma.appointment.findFirst({
            where: {
                id: appointmentId,
                patientId: patient.id,
                status: 'Completed',
            },
            include: {
                rating: true,
            },
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Completed appointment not found or does not belong to you',
            });
        }

        if (appointment.rating) {
            return res.status(400).json({
                success: false,
                message: 'You have already rated this appointment',
            });
        }

        // Create the rating
        const doctorRating = await prisma.doctorRating.create({
            data: {
                doctorId: appointment.doctorId,
                patientId: patient.id,
                appointmentId: appointmentId,
                rating: parseInt(rating),
                feedback: feedback || null,
            },
            include: {
                doctor: {
                    include: {
                        user: {
                            select: { firstName: true, lastName: true },
                        },
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: 'Rating submitted successfully',
            data: doctorRating,
        });
    } catch (error) {
        console.error('Submit rating error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit rating',
            error: error.message,
        });
    }
};

// Get all ratings for a specific doctor (public)
const getDoctorRatings = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const ratings = await prisma.doctorRating.findMany({
            where: { doctorId },
            include: {
                patient: {
                    include: {
                        user: {
                            select: { firstName: true, lastName: true, profileImage: true },
                        },
                    },
                },
                appointment: {
                    select: { appointmentDate: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate average rating
        const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;

        res.json({
            success: true,
            data: {
                ratings,
                averageRating: Math.round(avgRating * 10) / 10,
                totalRatings: ratings.length,
            },
        });
    } catch (error) {
        console.error('Get doctor ratings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch ratings',
            error: error.message,
        });
    }
};

// Get patient's submitted ratings
const getMyRatings = async (req, res) => {
    try {
        // Get patient from user ID
        const patient = await prisma.patient.findUnique({
            where: { userId: req.user.id },
        });

        if (!patient) {
            return res.status(403).json({
                success: false,
                message: 'Only patients can view their ratings',
            });
        }

        const ratings = await prisma.doctorRating.findMany({
            where: { patientId: patient.id },
            include: {
                doctor: {
                    include: {
                        user: {
                            select: { firstName: true, lastName: true, profileImage: true },
                        },
                        department: true,
                    },
                },
                appointment: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: ratings,
        });
    } catch (error) {
        console.error('Get my ratings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your ratings',
            error: error.message,
        });
    }
};

// Get doctor's own ratings (for doctor dashboard)
const getMyDoctorRatings = async (req, res) => {
    try {
        // Get doctor from user ID
        const doctor = await prisma.doctor.findUnique({
            where: { userId: req.user.id },
        });

        if (!doctor) {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can view their ratings',
            });
        }

        const ratings = await prisma.doctorRating.findMany({
            where: { doctorId: doctor.id },
            include: {
                patient: {
                    include: {
                        user: {
                            select: { firstName: true, lastName: true, profileImage: true },
                        },
                    },
                },
                appointment: {
                    select: { appointmentDate: true, appointmentTime: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate average rating
        const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;

        res.json({
            success: true,
            data: {
                ratings,
                averageRating: Math.round(avgRating * 10) / 10,
                totalRatings: ratings.length,
            },
        });
    } catch (error) {
        console.error('Get my doctor ratings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your ratings',
            error: error.message,
        });
    }
};

module.exports = {
    submitRating,
    getDoctorRatings,
    getMyRatings,
    getMyDoctorRatings,
};
