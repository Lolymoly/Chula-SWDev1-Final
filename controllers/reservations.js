const Reservation = require("../models/Reservation");
const User = require("../models/User");

// Get all reservations for admin
// @route  GET /reservations
exports.getReservations = async (req, res) => {
	try {
		const reservations = await Reservation.find();
		res
			.status(200)
			.json({ success: true, count: reservations.length, data: reservations });
	} catch (err) {
		res
			.status(400)
			.json({ success: false, message: "Failed to fetch reservations" });
	}
};

// Get single reservation
// @route  GET /reservations/:id
exports.getReservation = async (req, res) => {
	try {
		const reservation = await Reservation.findById(req.params.id);
		if (!reservation) {
			return res
				.status(404)
				.json({ success: false, message: "Reservation not found" });
		}
		// Ensure the reservation belongs to the user or the user is an admin
		if (
			reservation.userId.toString() !== req.user.id &&
			req.user.role !== "admin"
		) {
			return res.status(401).json({
				success: false,
				message: "Not authorized to access this reservation",
			});
		}
		res.status(200).json({ success: true, data: reservation });
	} catch (err) {
		res
			.status(400)
			.json({ success: false, message: "Failed to fetch reservation" });
	}
};

// Get all reservations for a specific user
// @route  GET /reservations/user/:userId
exports.getUserReservations = async (req, res) => {
	const { userId } = req.params;
	try {
		// Allow users to fetch their own reservations or let admins fetch any user's reservations
		if (req.user.id !== userId && req.user.role !== "admin") {
			return res
				.status(403)
				.json({ success: false, message: "Unauthorized access" });
		}
		const reservations = await Reservation.find({ userId: userId });
		res
			.status(200)
			.json({ success: true, count: reservations.length, data: reservations });
	} catch (err) {
		res
			.status(400)
			.json({ success: false, message: "Failed to fetch reservations" });
	}
};

// Create a reservation ensuring user is not banned from the restaurant
// @route  POST /reservations
exports.createReservation = async (req, res) => {
	const { restaurantId } = req.body; // Assuming restaurantId is part of the request body
	const userId = req.user.id; // User ID from the logged-in user's session

	try {
		const user = await User.findById(userId);
		if (user.banList.includes(restaurantId)) {
			return res.status(403).json({
				success: false,
				message: "Reservation failed: User is banned from this restaurant",
			});
		}

		const reservation = await Reservation.create({
			...req.body,
			userId: userId,
		});
		res.status(201).json({ success: true, data: reservation });
	} catch (err) {
		res.status(400).json({
			success: false,
			message: "Failed to create reservation",
			error: err.message,
		});
	}
};

// Update a reservation
// @route  PUT /reservations/:id
exports.updateReservation = async (req, res) => {
	try {
		let reservation = await Reservation.findById(req.params.id);
		if (!reservation) {
			return res
				.status(404)
				.json({ success: false, message: "Reservation not found" });
		}
		// Ensure the reservation belongs to the user or the user is an admin
		if (
			reservation.userId.toString() !== req.user.id &&
			req.user.role !== "admin"
		) {
			return res.status(401).json({
				success: false,
				message: "Not authorized to update this reservation",
			});
		}
		reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		res.status(200).json({ success: true, data: reservation });
	} catch (err) {
		res
			.status(400)
			.json({ success: false, message: "Failed to update reservation" });
	}
};

// Delete a reservation
// @route  DELETE /reservations/:id
exports.deleteReservation = async (req, res) => {
	try {
		const reservation = await Reservation.findById(req.params.id);
		console.log(reservation);
		if (!reservation) {
			return res
				.status(404)
				.json({ success: false, message: "Reservation not found" });
		}
		// Ensure the reservation belongs to the user or the user is an admin
		if (
			reservation.userId.toString() !== req.user.id &&
			req.user.role !== "admin"
		) {
			return res.status(401).json({
				success: false,
				message: "Not authorized to delete this reservation",
			});
		}
		await Reservation.findByIdAndDelete(req.params.id);
		// await reservation.remove();
		res.status(200).json({ success: true, data: {} });
	} catch (err) {
		console.log(err);
		res
			.status(500)
			.json({ success: false, message: "Failed to delete reservation" });
	}
};
