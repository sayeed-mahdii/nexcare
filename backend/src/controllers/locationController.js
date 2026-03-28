const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all locations
const getAllLocations = async (req, res) => {
    try {
        const { city, state } = req.query;

        const where = {};
        if (city) where.city = { contains: city };
        if (state) where.state = { contains: state };

        const locations = await prisma.location.findMany({
            where,
            include: {
                _count: {
                    select: { branches: true },
                },
            },
            orderBy: { name: 'asc' },
        });

        res.json({
            success: true,
            data: locations,
        });
    } catch (error) {
        console.error('Get locations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch locations.',
            error: error.message,
        });
    }
};

// Get location by ID
const getLocationById = async (req, res) => {
    try {
        const { id } = req.params;

        const location = await prisma.location.findUnique({
            where: { id },
            include: {
                branches: {
                    include: {
                        _count: {
                            select: { departments: true, labs: true },
                        },
                    },
                },
            },
        });

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found.',
            });
        }

        res.json({
            success: true,
            data: location,
        });
    } catch (error) {
        console.error('Get location error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch location.',
            error: error.message,
        });
    }
};

// Create location (Admin only)
const createLocation = async (req, res) => {
    try {
        const { name, city, state, zipCode } = req.body;

        const location = await prisma.location.create({
            data: { name, city, state, zipCode },
        });

        res.status(201).json({
            success: true,
            message: 'Location created successfully.',
            data: location,
        });
    } catch (error) {
        console.error('Create location error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create location.',
            error: error.message,
        });
    }
};

// Update location (Admin only)
const updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, city, state, zipCode } = req.body;

        const location = await prisma.location.update({
            where: { id },
            data: { name, city, state, zipCode },
        });

        res.json({
            success: true,
            message: 'Location updated successfully.',
            data: location,
        });
    } catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update location.',
            error: error.message,
        });
    }
};

// Delete location (Admin only)
const deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.location.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Location deleted successfully.',
        });
    } catch (error) {
        console.error('Delete location error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete location.',
            error: error.message,
        });
    }
};

module.exports = {
    getAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
};
