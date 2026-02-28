// 3rd Party Imports
const express = require("express");
// Custom Imports
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

// AUTH CONTROLLER
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// USER ConTROLLER - Public routes
router.get("/", userController.getAllUsers);
router.get("/verify-user/:id", userController.verifyUser);

// Protected routes - Apply middleware after public routes
router.use(authController.protect);

router
  .route("/:id")
  .get(userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);
router.post("/book-appointment", userController.bookAppointment);
router.post("/upload-documents", userController.uploadAppointmentDocuments);
router.post("/cancel-appointment", userController.cancelAppointment);
router.get("/user-appointments/:id", userController.userAppointments);
// NOTIFICATIONS
router.post("/mark-all-notification-as-seen", userController.notificationSeen);
router.post("/delete-all-notifications", userController.deleteNotifications);
// ADMIN
router.post("/change-doctor-status", authController.restrictTo("admin"), userController.doctorStatus);

module.exports = router;

