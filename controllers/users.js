const User = require("../models/User");

// Get all users
// @route  GET /users
exports.getUsers = async (req, res) => {
	try {
		const users = await User.find();
		res.status(200).json({ success: true, data: users });
	} catch (err) {
		res
			.status(500)
			.json({ success: false, message: "Failed to retrieve users" });
	}
};

// Get single user
// @route  GET /users/:id
exports.getUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}
		res.status(200).json({ success: true, data: user });
	} catch (err) {
		res.status(500).json({ success: false, message: "Failed to fetch user" });
	}
};

// Create new user (Public)
// @route  POST /users
exports.createUser = async (req, res) => {
	try {
		const user = await User.create(req.body);
		res.status(201).json({ success: true, data: user });
	} catch (err) {
		res.status(400).json({
			success: false,
			message: "Failed to create user",
			error: err.message,
		});
	}
};

// Update user
// @route  PUT /users/:id
exports.updateUser = async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		res.status(200).json({ success: true, data: user });
	} catch (err) {
		res.status(500).json({ success: false, message: "Failed to update user" });
	}
};

// Delete user (Admin only)
// @route  DELETE /users/:id
exports.deleteUser = async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);
		res.status(200).json({ success: true, data: {} });
	} catch (err) {
		res.status(500).json({ success: false, message: "Failed to delete user" });
	}
};
