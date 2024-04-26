const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
	getRestaurant,
	getRestaurants,
	createRestaurant,
	updateRestaurant,
	deleteRestaurant,
} = require("../controllers/restaurants");

const reservationsRouter = require("./reservations");

const router = express.Router();

// Use nested routes for reservations associated with a specific restaurant
router.use("/:restaurantId/reservations", reservationsRouter);

router
	.route("/")
	.get(getRestaurants) // Public access to view restaurants
	.post(protect, authorize("admin"), createRestaurant); // Only admin can add restaurants

router
	.route("/:id")
	.get(getRestaurant) // Public access to view a specific restaurant
	.put(protect, authorize("admin"), updateRestaurant) // Only admin can update restaurant details
	.delete(protect, authorize("admin"), deleteRestaurant); // Only admin can delete a restaurant

module.exports = router;
