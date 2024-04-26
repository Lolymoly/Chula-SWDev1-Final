const Reservation = require("../models/Reservation");

// Get all reservations for a user
exports.getReservations = async (req, res) => {
	try {
		let query;
		if (req.user.role === "admin") {
			query = Reservation.find().populate("restaurant");
		} else {
			query = Reservation.find({ userId: req.user.id }).populate("restaurant");
		}
		const reservations = await query;
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
exports.getReservation = async (req, res) => {
	try {
		const reservation = await Reservation.findById(req.params.id).populate(
			"restaurant"
		);
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
			return res
				.status(401)
				.json({
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

// Create a reservation
exports.createReservation = async (req, res) => {
	req.body.userId = req.user.id; // Set the user ID to the logged in user
	try {
		const reservation = await Reservation.create(req.body);
		res.status(201).json({ success: true, data: reservation });
	} catch (err) {
		res
			.status(400)
			.json({ success: false, message: "Failed to create reservation" });
	}
};

// Update a reservation
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
			return res
				.status(401)
				.json({
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
exports.deleteReservation = async (req, res) => {
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
			return res
				.status(401)
				.json({
					success: false,
					message: "Not authorized to delete this reservation",
				});
		}
		await reservation.remove();
		res.status(200).json({ success: true, data: {} });
	} catch (err) {
		res
			.status(500)
			.json({ success: false, message: "Failed to delete reservation" });
	}
};
