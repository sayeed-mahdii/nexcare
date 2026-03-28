const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all laboratories
const getAllLaboratories = async (req, res) => {
    try {
        const { branchId } = req.query;

        const where = {};
        if (branchId) where.branchId = branchId;

        const laboratories = await prisma.laboratory.findMany({
            where,
            include: {
                branch: {
                    include: { location: true },
                },
                _count: {
                    select: { reports: true },
                },
            },
            orderBy: { name: 'asc' },
        });

        res.json({
            success: true,
            data: laboratories,
        });
    } catch (error) {
        console.error('Get laboratories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch laboratories.',
            error: error.message,
        });
    }
};

// Get laboratory by ID
const getLaboratoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const laboratory = await prisma.laboratory.findUnique({
            where: { id },
            include: {
                branch: {
                    include: { location: true },
                },
                reports: {
                    take: 10,
                    orderBy: { reportDate: 'desc' },
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

        if (!laboratory) {
            return res.status(404).json({
                success: false,
                message: 'Laboratory not found.',
            });
        }

        res.json({
            success: true,
            data: laboratory,
        });
    } catch (error) {
        console.error('Get laboratory error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch laboratory.',
            error: error.message,
        });
    }
};

// Create laboratory (Admin only)
const createLaboratory = async (req, res) => {
    try {
        const { name, labType, branchId } = req.body;

        const laboratory = await prisma.laboratory.create({
            data: { name, labType, branchId },
            include: { branch: true },
        });

        res.status(201).json({
            success: true,
            message: 'Laboratory created successfully.',
            data: laboratory,
        });
    } catch (error) {
        console.error('Create laboratory error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create laboratory.',
            error: error.message,
        });
    }
};

// Update laboratory (Admin only)
const updateLaboratory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, labType, branchId } = req.body;

        const laboratory = await prisma.laboratory.update({
            where: { id },
            data: { name, labType, branchId },
            include: { branch: true },
        });

        res.json({
            success: true,
            message: 'Laboratory updated successfully.',
            data: laboratory,
        });
    } catch (error) {
        console.error('Update laboratory error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update laboratory.',
            error: error.message,
        });
    }
};

// Delete laboratory (Admin only)
const deleteLaboratory = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.laboratory.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Laboratory deleted successfully.',
        });
    } catch (error) {
        console.error('Delete laboratory error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete laboratory.',
            error: error.message,
        });
    }
};

module.exports = {
    getAllLaboratories,
    getLaboratoryById,
    createLaboratory,
    updateLaboratory,
    deleteLaboratory,
};
