const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all specialties
const getAllSpecialties = async (req, res) => {
    try {
        const specialties = await prisma.specialty.findMany({
            include: {
                _count: {
                    select: { doctors: true },
                },
            },
            orderBy: { name: 'asc' },
        });

        res.json({
            success: true,
            data: specialties,
        });
    } catch (error) {
        console.error('Get specialties error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch specialties.',
            error: error.message,
        });
    }
};

// Get specialty by ID
const getSpecialtyById = async (req, res) => {
    try {
        const { id } = req.params;

        const specialty = await prisma.specialty.findUnique({
            where: { id },
            include: {
                doctors: {
                    include: {
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
                    },
                },
            },
        });

        if (!specialty) {
            return res.status(404).json({
                success: false,
                message: 'Specialty not found.',
            });
        }

        res.json({
            success: true,
            data: specialty,
        });
    } catch (error) {
        console.error('Get specialty error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch specialty.',
            error: error.message,
        });
    }
};

// Create specialty (Admin only)
const createSpecialty = async (req, res) => {
    try {
        const { name } = req.body;

        const existingSpecialty = await prisma.specialty.findUnique({
            where: { name },
        });

        if (existingSpecialty) {
            return res.status(400).json({
                success: false,
                message: 'Specialty already exists.',
            });
        }

        const specialty = await prisma.specialty.create({
            data: { name },
        });

        res.status(201).json({
            success: true,
            message: 'Specialty created successfully.',
            data: specialty,
        });
    } catch (error) {
        console.error('Create specialty error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create specialty.',
            error: error.message,
        });
    }
};

// Update specialty (Admin only)
const updateSpecialty = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const specialty = await prisma.specialty.update({
            where: { id },
            data: { name },
        });

        res.json({
            success: true,
            message: 'Specialty updated successfully.',
            data: specialty,
        });
    } catch (error) {
        console.error('Update specialty error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update specialty.',
            error: error.message,
        });
    }
};

// Delete specialty (Admin only)
const deleteSpecialty = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.specialty.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Specialty deleted successfully.',
        });
    } catch (error) {
        console.error('Delete specialty error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete specialty.',
            error: error.message,
        });
    }
};

module.exports = {
    getAllSpecialties,
    getSpecialtyById,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
};
