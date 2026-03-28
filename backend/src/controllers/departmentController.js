const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all departments
const getAllDepartments = async (req, res) => {
    try {
        const { branchId } = req.query;

        const where = {};
        if (branchId) where.branchId = branchId;

        const departments = await prisma.department.findMany({
            where,
            include: {
                branch: {
                    include: { location: true },
                },
                _count: {
                    select: { doctors: true },
                },
            },
            orderBy: { name: 'asc' },
        });

        res.json({
            success: true,
            data: departments,
        });
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch departments.',
            error: error.message,
        });
    }
};

// Get department by ID
const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await prisma.department.findUnique({
            where: { id },
            include: {
                branch: {
                    include: { location: true },
                },
                doctors: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                profileImage: true,
                            },
                        },
                        specialties: {
                            include: { specialty: true },
                        },
                    },
                },
            },
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found.',
            });
        }

        res.json({
            success: true,
            data: department,
        });
    } catch (error) {
        console.error('Get department error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch department.',
            error: error.message,
        });
    }
};

// Create department (Admin only)
const createDepartment = async (req, res) => {
    try {
        const { name, branchId } = req.body;

        const department = await prisma.department.create({
            data: { name, branchId },
            include: { branch: true },
        });

        res.status(201).json({
            success: true,
            message: 'Department created successfully.',
            data: department,
        });
    } catch (error) {
        console.error('Create department error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create department.',
            error: error.message,
        });
    }
};

// Update department (Admin only)
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, branchId } = req.body;

        const department = await prisma.department.update({
            where: { id },
            data: { name, branchId },
            include: { branch: true },
        });

        res.json({
            success: true,
            message: 'Department updated successfully.',
            data: department,
        });
    } catch (error) {
        console.error('Update department error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update department.',
            error: error.message,
        });
    }
};

// Delete department (Admin only)
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.department.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Department deleted successfully.',
        });
    } catch (error) {
        console.error('Delete department error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete department.',
            error: error.message,
        });
    }
};

module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
};
