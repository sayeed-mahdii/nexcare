const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all tests with filters
const getAllTests = async (req, res) => {
    try {
        const { category, departmentId, isGeneral, isActive = true, search, page = 1, limit = 50 } = req.query;

        const where = {};

        if (category) where.category = category;
        if (departmentId) where.departmentId = departmentId;
        if (isGeneral !== undefined) where.isGeneral = isGeneral === 'true';
        if (isActive !== undefined) where.isActive = isActive === 'true';

        if (search) {
            where.name = { contains: search };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [tests, total] = await Promise.all([
            prisma.test.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    department: true,
                },
                orderBy: { name: 'asc' },
            }),
            prisma.test.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                tests,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get tests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tests.',
            error: error.message,
        });
    }
};

// Get tests for doctor ordering (department tests + general tests)
const getTestsForOrdering = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const { search } = req.query;

        // Build queries for different test types
        const baseWhere = { isActive: true };

        // If search is provided, search all tests
        if (search) {
            const tests = await prisma.test.findMany({
                where: {
                    ...baseWhere,
                    name: { contains: search },
                },
                include: { department: true },
                orderBy: { name: 'asc' },
                take: 20,
            });

            return res.json({
                success: true,
                data: { searchResults: tests },
            });
        }

        // Get department mandatory tests
        const mandatoryTests = await prisma.test.findMany({
            where: {
                ...baseWhere,
                departmentId,
                isMandatory: true,
            },
            include: { department: true },
            orderBy: { name: 'asc' },
        });

        // Get department suggested tests
        const departmentTests = await prisma.test.findMany({
            where: {
                ...baseWhere,
                departmentId,
                isMandatory: false,
            },
            include: { department: true },
            orderBy: { name: 'asc' },
        });

        // Get general tests
        const generalTests = await prisma.test.findMany({
            where: {
                ...baseWhere,
                isGeneral: true,
            },
            include: { department: true },
            orderBy: { name: 'asc' },
        });

        res.json({
            success: true,
            data: {
                mandatoryTests,
                departmentTests,
                generalTests,
            },
        });
    } catch (error) {
        console.error('Get tests for ordering error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tests.',
            error: error.message,
        });
    }
};

// Get single test by ID
const getTestById = async (req, res) => {
    try {
        const { id } = req.params;

        const test = await prisma.test.findUnique({
            where: { id },
            include: { department: true },
        });

        if (!test) {
            return res.status(404).json({
                success: false,
                message: 'Test not found.',
            });
        }

        res.json({
            success: true,
            data: test,
        });
    } catch (error) {
        console.error('Get test error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch test.',
            error: error.message,
        });
    }
};

// Create new test (Admin only)
const createTest = async (req, res) => {
    try {
        const {
            name,
            category,
            isGeneral,
            isMandatory,
            departmentId,
            inputType,
            unit,
            referenceRange,
            price,
            requiresPathologist,
        } = req.body;

        const test = await prisma.test.create({
            data: {
                name,
                category: category || 'LAB',
                isGeneral: isGeneral || false,
                isMandatory: isMandatory || false,
                departmentId: departmentId || null,
                inputType: inputType || 'NUMERIC',
                unit,
                referenceRange,
                price: price || 0,
                requiresPathologist: requiresPathologist !== false,
            },
            include: { department: true },
        });

        res.status(201).json({
            success: true,
            message: 'Test created successfully.',
            data: test,
        });
    } catch (error) {
        console.error('Create test error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create test.',
            error: error.message,
        });
    }
};

// Update test (Admin only)
const updateTest = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const test = await prisma.test.update({
            where: { id },
            data: updateData,
            include: { department: true },
        });

        res.json({
            success: true,
            message: 'Test updated successfully.',
            data: test,
        });
    } catch (error) {
        console.error('Update test error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update test.',
            error: error.message,
        });
    }
};

// Deactivate test (Admin only) - soft delete
const deleteTest = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.test.update({
            where: { id },
            data: { isActive: false },
        });

        res.json({
            success: true,
            message: 'Test deactivated successfully.',
        });
    } catch (error) {
        console.error('Delete test error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate test.',
            error: error.message,
        });
    }
};

module.exports = {
    getAllTests,
    getTestsForOrdering,
    getTestById,
    createTest,
    updateTest,
    deleteTest,
};
