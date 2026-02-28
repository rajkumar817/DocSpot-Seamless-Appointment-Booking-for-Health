// 3rd Party Imports
const express = require("express");
// Custom Imports
const authController = require("../controllers/authController");
const doctorController = require("../controllers/doctorController");

const router = express.Router();

// DOCTOR CONTROLLER
router.get("/", doctorController.getAllDoctors);
router.get("/approved-doctors", doctorController.getAllApprovedDoctors);

router.use(authController.protect);

router.post("/signup", doctorController.doctorSignup);
router.post(
  "/check-booking-availability",
  doctorController.checkBookingAvailability
);
router.post(
  "/change-appointment-status",
  doctorController.changeAppointmentStatus
);
router.post(
  "/consultation/:appointmentId",
  doctorController.addConsultationData
);
router.get(
  "/consultation/:appointmentId",
  doctorController.getConsultationData
);
router
  .route("/reschedule-appointment")
  .post(authController.protect, doctorController.rescheduleAppointment);

router
  .route("/mark-no-show")
  .post(authController.protect, doctorController.markAsNoShow);

router.get("/appointments/:id", doctorController.doctorAppointments);
router.get("/booked-appointments/:id", doctorController.getBookAppointments);
router.get("/:id", doctorController.getDoctor);
router.put("/:id", doctorController.updateDoctor);

module.exports = router;
