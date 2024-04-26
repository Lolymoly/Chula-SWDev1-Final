const Restaurant = require("../models/Restaurant");

// Get all restaurants
exports.getRestaurants = async (req, res) => {
	try {
		const restaurants = await Restaurant.find();
		res
			.status(200)
			.json({ success: true, count: restaurants.length, data: restaurants });
	} catch (err) {
		res
			.status(400)
			.json({ success: false, message: "Failed to fetch restaurants" });
	}
};

// Get single restaurant
exports.getRestaurant = async (req, res) => {
	try {
		const restaurant = await Restaurant.findById(req.params.id);
		if (!restaurant) {
			return res
				.status(404)
				.json({ success: false, message: "Restaurant not found" });
		}
		res.status(200).json({ success: true, data: restaurant });
	} catch (err) {
		res
			.status(400)
			.json({ success: false, message: "Failed to fetch restaurant" });
	}
};

// Create a restaurant
exports.createRestaurant = async (req, res) => {
	try {
		const restaurant = await Restaurant.create(req.body);
		res.status(201).json({ success: true, data: restaurant });
	} catch (err) {
		res
			.status(400)
			.json({ success: false, message: "Failed to create restaurant" });
	}
};

// Update a restaurant
exports.updateRestaurant = async (req, res) => {
	try {
		const restaurant = await Restaurant.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true, runValidators: true }
		);
		if (!restaurant) {
			return res
				.status(404)
				.json({ success: false, message: "Restaurant not found" });
		}
		res.status(200).json({ success: true, data: restaurant });
	} catch (err) {
		res
			.status(400)
			.json({ success: false, message: "Failed to update restaurant" });
	}
};

// Delete a restaurant
exports.deleteRestaurant = async (req, res) => {
	try {
		const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
		if (!restaurant) {
			return res
				.status(404)
				.json({ success: false, message: "Restaurant not found" });
		}
		res.status(200).json({ success: true, data: {} });
	} catch (err) {
		res
			.status(400)
			.json({ success: false, message: "Failed to delete restaurant" });
	}
};
