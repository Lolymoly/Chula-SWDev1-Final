const express = require("express");
const {
	getReservations,
	getReservation,
	createReservation,
	updateReservation,
	deleteReservation,
	getUserReservations,
} = require("../controllers/reservations");

const router = express.Router({ mergeParams: true });
const { protect, authorize } = require("../middleware/auth");

router
	.route("/")
	.get(protect, authorize("admin"), getReservations) // User and admin can view reservations
	.post(protect, createReservation); // Only logged-in users can create reservations

router.get("/user/:userId", protect, getUserReservations);

router
	.route("/:id")
	.get(protect, getReservation) // User and admin can view specific reservation
	.put(protect, updateReservation) // User can update their reservations, admin can update any reservation
	.delete(protect, deleteReservation); // User can delete their reservations, admin can delete any reservation

module.exports = router;
