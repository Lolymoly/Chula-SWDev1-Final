const Restaurant = require("../models/Restaurant");
const Reservation = require("../models/Reservation");
const User = require("../models/User");

// Get all restaurants
// @route  GET /restaurants
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
// @route  GET /restaurants/:id
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
// @route  POST /restaurants
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
// @route  PUT /restaurants/:id
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
// @route  DELETE /restaurants/:id
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

// Search for restaurants with optional filters
// @route  GET /restaurants/search
exports.searchRestaurants = async (req, res) => {
	const { name, address, telephone, openTime, closeTime } = req.query;
	console.log(req.query);

	try {
		// Create a dynamic query object based on provided parameters
		const queryConditions = [];
		if (name) queryConditions.push({ name: { $regex: name, $options: "i" } });
		if (address)
			queryConditions.push({ address: { $regex: address, $options: "i" } });
		if (telephone)
			queryConditions.push({ telephone: { $regex: telephone, $options: "i" } });
		if (openTime)
			queryConditions.push({ openTime: { $regex: openTime, $options: "i" } });
		if (closeTime)
			queryConditions.push({ closeTime: { $regex: closeTime, $options: "i" } });

		let restaurants;
		if (queryConditions.length > 0) {
			restaurants = await Restaurant.find({ $or: queryConditions });
		} else {
			// If no query parameters are provided, fetch all restaurants
			restaurants = await Restaurant.find();
		}

		res
			.status(200)
			.json({ success: true, count: restaurants.length, data: restaurants });
	} catch (err) {
		console.error("Search Error: ", err);
		res.status(400).json({
			success: false,
			message: "Failed to search for restaurants",
			error: err.message,
		});
	}
};

// Toggle favorite restaurant
// @route  POST /restaurants/:restaurantId/toggle-favorite/:userId
exports.toggleFavoriteRestaurant = async (req, res) => {
	const { userId, restaurantId } = req.params;

	try {
		// Optional: Check if the logged-in user is allowed to toggle favorites for this userId
		if (req.user.id !== userId && req.user.role !== "admin") {
			return res.status(403).json({
				success: false,
				message: "Unauthorized to modify another user's favorites",
			});
		}

		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		const index = user.favList.indexOf(restaurantId);
		if (index > -1) {
			user.favList.splice(index, 1); // Remove if already favorited
		} else {
			user.favList.push(restaurantId); // Add to favorites if not already
		}
		await user.save();
		res.status(200).json({ success: true, data: user.favList });
	} catch (err) {
		res.status(400).json({
			success: false,
			message: "Failed to toggle favorite",
			error: err.message,
		});
	}
};

// Ban a user from a restaurant (Admin only) and delete their reservations
// @route  POST /restaurants/:restaurantId/ban-user/:userId
exports.banUserFromRestaurant = async (req, res) => {
	const { restaurantId, userId } = req.params;

	try {
		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}
		if (user.banList.includes(restaurantId)) {
			return res.status(400).json({
				success: false,
				message: "User is already banned from this restaurant",
			});
		}
		// Delete all reservations for this user at the specified restaurant
		await Reservation.deleteMany({
			userId: userId,
			restaurantId: restaurantId,
		});

		// Ban the user from the restaurant
		user.banList.push(restaurantId);
		await user.save();
		res.status(200).json({
			success: true,
			message:
				"User has been banned from the restaurant and all reservations have been canceled",
			data: user.banList,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Failed to ban user from restaurant",
			error: err.message,
		});
	}
};

// Unban a user from a restaurant (Admin only)
// @route  POST /restaurants/:restaurantId/unban-user/:userId
exports.unbanUserFromRestaurant = async (req, res) => {
	const { restaurantId, userId } = req.params;

	try {
		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		const index = user.banList.indexOf(restaurantId);
		if (index === -1) {
			return res.status(400).json({
				success: false,
				message: "User is not banned from this restaurant",
			});
		}

		// Remove the restaurant from the user's ban list
		user.banList.splice(index, 1);
		await user.save();

		res.status(200).json({
			success: true,
			message: "User has been unbanned from the restaurant",
			data: user.banList,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Failed to unban user from restaurant",
			error: err.message,
		});
	}
};
