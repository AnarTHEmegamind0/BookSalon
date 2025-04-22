const { body } = require('express-validator');
const Salon = require('../models/Salon');

// Get all salons
const getSalons = async (req, res, next) => {
  try {
    const { city, service, rating, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by city
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }
    
    // Filter by service
    if (service) {
      query['services.name'] = { $regex: service, $options: 'i' };
    }
    
    // Filter by rating
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const salons = await Salon.find(query)
      .populate('owner', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rating: -1 });
    
    // Get total count
    const total = await Salon.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        salons,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get salon by id
const getSalonById = async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('reviews.user', 'name profileImage');
    
    if (!salon) {
      return res.status(404).json({
        success: false,
        error: 'Salon not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        salon
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create salon (salon-owner only)
const createSalon = async (req, res, next) => {
  try {
    const { name, location, services, operatingHours, images } = req.body;
    
    // Check if user is a salon owner
    if (req.user.role !== 'salon-owner') {
      return res.status(403).json({
        success: false,
        error: 'Only salon owners can create salons'
      });
    }
    
    // Create salon
    const salon = await Salon.create({
      name,
      owner: req.user._id,
      location,
      services,
      operatingHours,
      images
    });
    
    res.status(201).json({
      success: true,
      message: 'Salon created successfully',
      data: {
        salon
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update salon (owner only)
const updateSalon = async (req, res, next) => {
  try {
    const { name, location, services, operatingHours, images } = req.body;
    
    // Find salon
    const salon = await Salon.findById(req.params.id);
    
    if (!salon) {
      return res.status(404).json({
        success: false,
        error: 'Salon not found'
      });
    }
    
    // Check if user is the salon owner
    if (salon.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update this salon'
      });
    }
    
    // Update salon fields
    if (name) salon.name = name;
    if (location) salon.location = location;
    if (services) salon.services = services;
    if (operatingHours) salon.operatingHours = operatingHours;
    if (images) salon.images = images;
    
    // Save salon
    await salon.save();
    
    res.status(200).json({
      success: true,
      message: 'Salon updated successfully',
      data: {
        salon
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete salon (owner or admin only)
const deleteSalon = async (req, res, next) => {
  try {
    // Find salon
    const salon = await Salon.findById(req.params.id);

    if (!salon) {
      return res.status(404).json({
        success: false,
        error: 'Salon not found'
      });
    }

    // Check if user is the salon owner or admin
    if (salon.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this salon'
      });
    }

    // Delete salon
    await salon.remove();

    res.status(200).json({
      success: true,
      message: 'Salon deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalons,
  getSalonById,
  createSalon,
  updateSalon,
  deleteSalon
};