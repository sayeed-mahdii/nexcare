const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all branches
const getAllBranches = async (req, res) => {
    try {
        const { locationId } = req.query;

        const where = {};
        if (locationId) where.locationId = locationId;

        const branches = await prisma.branch.findMany({
            where,
            include: {
                location: true,
                _count: {
                    select: {
                        departments: true,
                        labs: true,
                        appointments: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        res.json({
            success: true,
            data: branches,
        });
    } catch (error) {
        console.error('Get branches error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch branches.',
            error: error.message,
        });
    }
};

// Get branch by ID
const getBranchById = async (req, res) => {
    try {
        const { id } = req.params;

        const branch = await prisma.branch.findUnique({
            where: { id },
            include: {
                location: true,
                departments: {
                    include: {
                        _count: {
                            select: { doctors: true },
                        },
                    },
                },
                labs: true,
            },
        });

        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Branch not found.',
            });
        }

        res.json({
            success: true,
            data: branch,
        });
    } catch (error) {
        console.error('Get branch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch branch.',
            error: error.message,
        });
    }
};

// Create branch (Admin only)
const createBranch = async (req, res) => {
    try {
        const { name, phone, locationId } = req.body;

        const branch = await prisma.branch.create({
            data: {
                name,
                phone,
                locationId,
            },
            include: { location: true },
        });

        res.status(201).json({
            success: true,
            message: 'Branch created successfully.',
            data: branch,
        });
    } catch (error) {
        console.error('Create branch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create branch.',
            error: error.message,
        });
    }
};

// Update branch (Admin only)
const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, locationId } = req.body;

        const branch = await prisma.branch.update({
            where: { id },
            data: { name, phone, locationId },
            include: { location: true },
        });

        res.json({
            success: true,
            message: 'Branch updated successfully.',
            data: branch,
        });
    } catch (error) {
        console.error('Update branch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update branch.',
            error: error.message,
        });
    }
};

// Delete branch (Admin only)
const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.branch.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Branch deleted successfully.',
        });
    } catch (error) {
        console.error('Delete branch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete branch.',
            error: error.message,
        });
    }
};

module.exports = {
    getAllBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch,
};
