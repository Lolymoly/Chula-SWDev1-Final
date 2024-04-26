const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
	getRestaurant,
	getRestaurants,
	createRestaurant,
	updateRestaurant,
	deleteRestaurant,
	searchRestaurants,
	toggleFavoriteRestaurant,
	banUserFromRestaurant,
	unbanUserFromRestaurant,
} = require("../controllers/restaurants");

const reservationsRouter = require("./reservations");

const router = express.Router();

// Search and favorite functionality
router.get("/search", searchRestaurants); // Public search for restaurants
router.post(
	"/:restaurantId/toggle-favorite/:userId",
	protect,
	toggleFavoriteRestaurant
); // Toggle favorite for logged-in users

// Ban a user from a restaurant (Admin only)
router.post(
	"/:restaurantId/ban-user/:userId",
	protect,
	authorize("admin"),
	banUserFromRestaurant
);

router.post(
	"/:restaurantId/unban-user/:userId",
	protect,
	authorize("admin"),
	unbanUserFromRestaurant
);

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
