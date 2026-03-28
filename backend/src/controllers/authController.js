const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { sendOTPEmail } = require('../utils/emailService');

const prisma = new PrismaClient();

// Register new user
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, role, gender, phone, ...additionalData } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered.',
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
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
        if (role === 'Doctor') {
            await prisma.doctor.create({
                data: {
                    userId: user.id,
                    qualification: additionalData.qualification || 'MBBS',
                    experienceYears: parseInt(additionalData.experienceYears) || 0,
                    departmentId: additionalData.departmentId,
                    isApproved: false, // Doctors need admin approval
                },
            });

            // Emit socket event for admin notification
            const io = req.app.get('io');
            if (io) {
                io.emit('doctor:pending', {
                    message: 'New doctor registration pending approval',
                    doctor: {
                        name: `${firstName} ${lastName}`,
                        email,
                        qualification: additionalData.qualification,
                    },
                });
            }

            // Return success without token - doctor needs approval
            return res.status(201).json({
                success: true,
                message: 'Registration successful. Your account is pending admin approval. You will be notified once approved.',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                    },
                    pendingApproval: true,
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

        // Generate token (for non-doctor roles)
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful.',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    gender: user.gender,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed.',
            error: error.message,
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                doctor: {
                    include: {
                        department: true,
                    },
                },
                patient: true,
                pathologist: true,
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        // Check if doctor is approved
        if (user.role === 'Doctor' && user.doctor) {
            if (user.doctor.rejectedReason) {
                return res.status(403).json({
                    success: false,
                    message: `Your application was rejected. Reason: ${user.doctor.rejectedReason}`,
                    rejected: true,
                });
            }
            if (!user.doctor.isApproved) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account is pending admin approval. Please wait for approval notification.',
                    pendingApproval: true,
                });
            }
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful.',
            data: {
                user: userWithoutPassword,
                token,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed.',
            error: error.message,
        });
    }
};

// Get current user profile
const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                doctor: {
                    include: {
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
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile.',
            error: error.message,
        });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, profileImage, ...additionalData } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                firstName,
                lastName,
                phone,
                profileImage,
            },
        });

        // Update role-specific data
        if (req.user.role === 'Patient' && additionalData.medicalHistory !== undefined) {
            await prisma.patient.update({
                where: { userId: req.user.id },
                data: { medicalHistory: additionalData.medicalHistory },
            });
        }

        const { password: _, ...userWithoutPassword } = updatedUser;

        res.json({
            success: true,
            message: 'Profile updated successfully.',
            data: userWithoutPassword,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile.',
            error: error.message,
        });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);

        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect.',
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: req.user.id },
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

// Forgot Password - Send OTP to email
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email address.',
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete any existing OTPs for this email
        await prisma.passwordReset.deleteMany({
            where: { email },
        });

        // Save new OTP
        await prisma.passwordReset.create({
            data: {
                email,
                otp,
                expiresAt,
            },
        });

        // Send OTP email
        await sendOTPEmail(email, otp, user.firstName);

        res.json({
            success: true,
            message: 'OTP has been sent to your email address.',
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP. Please try again.',
            error: error.message,
        });
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find the OTP record
        const resetRecord = await prisma.passwordReset.findFirst({
            where: {
                email,
                otp,
            },
        });

        if (!resetRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP. Please check and try again.',
            });
        }

        // Check if OTP has expired
        if (new Date() > resetRecord.expiresAt) {
            await prisma.passwordReset.delete({
                where: { id: resetRecord.id },
            });
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.',
            });
        }

        // Mark OTP as verified
        await prisma.passwordReset.update({
            where: { id: resetRecord.id },
            data: { verified: true },
        });

        res.json({
            success: true,
            message: 'OTP verified successfully.',
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP.',
            error: error.message,
        });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Find verified OTP record
        const resetRecord = await prisma.passwordReset.findFirst({
            where: {
                email,
                otp,
                verified: true,
            },
        });

        if (!resetRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or unverified OTP. Please verify your OTP first.',
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
            include: {
                doctor: {
                    include: {
                        department: true,
                    },
                },
                patient: true,
                pathologist: true,
            },
        });

        // Delete used OTP
        await prisma.passwordReset.delete({
            where: { id: resetRecord.id },
        });

        // Generate token for auto-login
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Password reset successful!',
            data: {
                user: userWithoutPassword,
                token,
            },
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password.',
            error: error.message,
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    forgotPassword,
    verifyOtp,
    resetPassword,
};
