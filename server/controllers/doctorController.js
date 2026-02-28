const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");
const Appointment = require("../models/appointmentModel");
const moment = require("moment");
const logActivity = require("../utils/logActivity");

exports.doctorSignup = catchAsync(async (req, res, next) => {
  // find doctor if already applied
  const doctor = await Doctor.findOne({ email: req.body.email });
  if (doctor)
    return next(
      new AppError(
        "Doctor already applied Please contact your admin clinic",
        400
      )
    );

  const newDoctor = new Doctor({
    ...req.body,
    status: "pending",
    bio: req.body.bio,
    languages: req.body.languages,
  });
  await newDoctor.save();

  const adminUser = await User.findOne({ isAdmin: true });

  const unseenNotifications = adminUser.unseenNotifications;
  unseenNotifications.push({
    type: "new-doctor-request",
    message: `${newDoctor.fullName} has requested to join as a doctor.`,
    data: {
      doctorId: newDoctor._id,
      name: newDoctor.fullName,
    },
    onClickPath: "/admin/doctors",
  });

  await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });

  // Send real-time notification
  const io = req.app.get("io");
  if (io) {
    io.to(adminUser._id.toString()).emit("new-notification", {
      type: "new-doctor-request",
      message: `${newDoctor.fullName} has requested to join as a doctor.`,
    });
  }

  res.status(200).send({
    status: true,
    message: "Doctor account applied successfully",
  });
});

exports.getAllDoctors = catchAsync(async (req, res, next) => {
  const doctors = await Doctor.find();

  res.status(200).send({
    status: true,
    message: "All doctors fetched successfully",
    data: doctors,
  });
});

exports.getDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOne({ userId: req.params.id });
  if (!doctor) return next(new AppError("Doctor not found", 404));

  res.status(200).send({
    status: true,
    message: "Doctor fetched successfully",
    data: doctor,
  });
});

exports.updateDoctor = catchAsync(async (req, res, next) => {
  const { body } = req.body;

  const doctor = await Doctor.findOneAndUpdate(
    { userId: req.params.id },
    body,
    { new: true }
  );

  if (!doctor) return next(new AppError("Doctor not found", 404));

  res.status(200).send({
    status: true,
    message: "Doctor updated successfully",
    data: doctor,
  });
});

exports.getAllApprovedDoctors = catchAsync(async (req, res, next) => {
  const doctors = await Doctor.find({ status: "approved" });

  res.status(200).send({
    status: true,
    message: "All approved doctors fetched successfully",
    data: doctors,
  });
});

exports.checkBookingAvailability = catchAsync(async (req, res, next) => {
  console.log("=== CHECK BOOKING AVAILABILITY ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  // Validate required fields
  if (!req.body.doctorId) {
    return next(new AppError("Doctor ID is required", 400));
  }

  if (!req.body.date) {
    return next(new AppError("Date is required", 400));
  }

  if (!req.body.time) {
    return next(new AppError("Time is required", 400));
  }

  // Find Doctor and see his timings
  const doctor = await Doctor.findOne({ userId: req.body.doctorId });

  if (!doctor) {
    return next(new AppError("Doctor not found", 404));
  }

  console.log("Doctor fromTime (raw):", doctor.fromTime);
  console.log("Doctor toTime (raw):", doctor.toTime);
  console.log("Appointment time (raw):", req.body.time);
  console.log("Appointment date (raw):", req.body.date);

  // Parse doctor's working hours - they are UTC strings, parse as UTC then convert to local
  const doctorFromTime = moment.utc(doctor.fromTime).local();
  const doctorToTime = moment.utc(doctor.toTime).local();

  // Extract hours and minutes only (now in local time)
  const doctorFromHour = doctorFromTime.hours();
  const doctorFromMinute = doctorFromTime.minutes();
  const doctorToHour = doctorToTime.hours();
  const doctorToMinute = doctorToTime.minutes();

  console.log(`Doctor working hours: ${doctorFromHour}:${doctorFromMinute} to ${doctorToHour}:${doctorToMinute}`);

  // Parse the appointment time - also UTC, convert to local
  const appointmentTime = moment.utc(req.body.time).local();

  if (!appointmentTime.isValid()) {
    return next(new AppError("Invalid time format provided", 400));
  }

  // Extract hours and minutes from appointment time (now in local time)
  const appointmentHour = appointmentTime.hours();
  const appointmentMinute = appointmentTime.minutes();

  console.log(`Appointment time: ${appointmentHour}:${appointmentMinute}`);

  // Parse the date
  const parsedDate = moment.utc(req.body.date).local();

  if (!parsedDate.isValid()) {
    return next(new AppError("Invalid date format provided", 400));
  }

  const date = parsedDate.format("YYYY-MM-DD");
  console.log("Appointment date:", date);

  // Check if the date is in the past
  const today = moment().startOf('day');
  const appointmentDate = moment(date).startOf('day');

  if (appointmentDate.isBefore(today)) {
    return next(new AppError("Cannot book appointments for past dates", 400));
  }

  // Convert to minutes since midnight for accurate comparison
  const appointmentMinutes = appointmentHour * 60 + appointmentMinute;
  const doctorFromMinutes = doctorFromHour * 60 + doctorFromMinute;
  const doctorToMinutes = doctorToHour * 60 + doctorToMinute;

  console.log("Appointment minutes since midnight:", appointmentMinutes);
  console.log("Doctor from minutes since midnight:", doctorFromMinutes);
  console.log("Doctor to minutes since midnight:", doctorToMinutes);

  // Format for display
  const displayFromTime = moment().hours(doctorFromHour).minutes(doctorFromMinute).format("hh:mm A");
  const displayToTime = moment().hours(doctorToHour).minutes(doctorToMinute).format("hh:mm A");

  console.log(`Display times: ${displayFromTime} to ${displayToTime}`);

  // Check if appointment time is within doctor's working hours
  if (
    appointmentMinutes < doctorFromMinutes ||
    appointmentMinutes > doctorToMinutes
  ) {
    console.log("❌ Appointment time is outside working hours");
    return next(
      new AppError(
        `Please select a time within the doctor's working hours ${displayFromTime} to ${displayToTime}`,
        400
      )
    );
  }

  console.log("✅ Appointment time is within working hours");

  // Check if the selected time slot is already booked
  const appointments = await Appointment.find({
    doctorId: req.body.doctorId,
    date: date,
    status: { $ne: "rejected" }, // Exclude rejected appointments
  });

  console.log(`Found ${appointments.length} existing appointments for this date`);

  // Check if the selected time slot is already booked
  const isSlotAvailable = !appointments.some((appointment) => {
    const appointmentMoment = moment(appointment.time);
    const slotHour = appointmentMoment.hours();
    const slotMinute = appointmentMoment.minutes();
    const slotStartMinutes = slotHour * 60 + slotMinute;
    const slotEndMinutes = slotStartMinutes + 30; // 30 min consultation time

    const requestedStartMinutes = appointmentMinutes - 30; // 30 min before
    const requestedEndMinutes = appointmentMinutes + 15; // 15 min after

    console.log(`Checking slot: ${slotHour}:${slotMinute} (${slotStartMinutes}-${slotEndMinutes} mins) vs requested (${requestedStartMinutes}-${requestedEndMinutes} mins)`);

    // Check for overlap
    const hasOverlap = requestedStartMinutes < slotEndMinutes &&
      requestedEndMinutes > slotStartMinutes;

    if (hasOverlap) {
      console.log("❌ Slot conflict detected");
    }

    return hasOverlap;
  });

  if (!isSlotAvailable) {
    console.log("❌ Appointment slot not available");
    return next(new AppError("Appointment slot not available", 400));
  }

  console.log("✅ Appointment slot is available");
  res.status(200).send({
    status: true,
    message: "Appointment available",
  });
});

exports.doctorAppointments = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOne({ userId: req.params.id });
  if (!doctor) return next(new AppError("Doctor not found", 404));

  const appointments = await Appointment.find({ doctorId: doctor.userId });
  res.status(200).json({
    status: "success",
    message: "Appointments fetched successfully.",
    data: appointments,
  });
});

exports.changeAppointmentStatus = catchAsync(async (req, res, next) => {
  const { appointmentId, status } = req.body;

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) return next(new AppError("Appointment not found", 404));

  // Update appointment status
  appointment.status = status;

  // Set completion timestamp when marking as completed
  if (status === "completed") {
    appointment.completedAt = new Date();
  }

  await appointment.save();

  // find user and send notification
  const user = await User.findById(appointment.userId);

  const unseenNotifications = user.unseenNotifications;
  unseenNotifications.push({
    type: "appointment-status-changed",
    message: `Your appointment status has been ${status}`,
    data: {
      name: user.name,
    },
    onClickPath: "/appointments",
  });

  await user.save();

  // Send real-time notification
  const io = req.app.get("io");
  if (io) {
    io.to(user._id.toString()).emit("new-notification", {
      type: "appointment-status-changed",
      message: `Your appointment status has been ${status}`,
    });
  }

  await logActivity(req, "Appointment Status Change", `Doctor changed appointment ${appointmentId} status to ${status}`);

  res.status(200).send({
    status: true,
    message: "Appointment status changed successfully",
  });
});

exports.getBookAppointments = catchAsync(async (req, res, next) => {
  const appointments = await Appointment.find({
    doctorId: req.params.id,
    status: "approved",
  });
  res.status(200).send({
    status: true,
    message: "Appointments fetched successfully",
    data: appointments,
  });
});

exports.addConsultationData = catchAsync(async (req, res, next) => {
  const { appointmentId } = req.params;
  const { consultationNotes, prescription, medicalRecord } = req.body;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) return next(new AppError("Appointment not found", 404));

  // Update consultation notes and prescription
  if (consultationNotes !== undefined) {
    appointment.consultationNotes = consultationNotes;
  }
  if (prescription !== undefined) {
    appointment.prescription = prescription;
  }

  // Add medical record if provided
  if (medicalRecord) {
    if (!appointment.medicalRecords) {
      appointment.medicalRecords = [];
    }
    appointment.medicalRecords.push({
      fileName: medicalRecord.fileName,
      fileType: medicalRecord.fileType,
      fileSize: medicalRecord.fileSize,
      fileData: medicalRecord.fileData,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
    });
  }

  // Mark appointment as completed after consultation
  appointment.status = "completed";

  await appointment.save();

  res.status(200).send({
    status: true,
    message: "Consultation data saved successfully",
    data: appointment,
  });
});

exports.getConsultationData = catchAsync(async (req, res, next) => {
  const { appointmentId } = req.params;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) return next(new AppError("Appointment not found", 404));

  res.status(200).send({
    status: true,
    message: "Consultation data fetched successfully",
    data: {
      consultationNotes: appointment.consultationNotes || "",
      prescription: appointment.prescription || "",
      medicalRecords: appointment.medicalRecords || [],
    },
  });
});

exports.rescheduleAppointment = catchAsync(async (req, res, next) => {
  const { appointmentId, date, time } = req.body;

  // Validate required fields
  if (!appointmentId) {
    return next(new AppError("Appointment ID is required", 400));
  }

  if (!date) {
    return next(new AppError("Date is required", 400));
  }

  if (!time) {
    return next(new AppError("Time is required", 400));
  }

  // Find the appointment
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Prevent rescheduling completed appointments
  if (appointment.status === "completed") {
    return next(new AppError("Cannot reschedule completed appointments. The consultation has already been provided.", 400));
  }

  // Check if appointment is within 12 hours
  const appointmentDateTime = moment(`${appointment.date} ${appointment.time}`);
  const currentTime = moment();
  const hoursDifference = appointmentDateTime.diff(currentTime, 'hours', true);

  console.log("Current time:", currentTime.format());
  console.log("Appointment time:", appointmentDateTime.format());
  console.log("Hours difference:", hoursDifference);

  if (hoursDifference < 12) {
    return next(new AppError("Rescheduling is not possible at this time. Appointments can only be rescheduled at least 12 hours in advance.", 400));
  }

  // Find Doctor and see his timings
  const doctor = await Doctor.findOne({ userId: appointment.doctorId });
  if (!doctor) {
    return next(new AppError("Doctor not found", 404));
  }

  console.log("=== RESCHEDULE APPOINTMENT ===");
  console.log("Doctor fromTime (raw):", doctor.fromTime);
  console.log("Doctor toTime (raw):", doctor.toTime);
  console.log("New appointment time (raw):", time);
  console.log("New appointment date (raw):", date);

  // Parse doctor's working hours - they are UTC strings, parse as UTC then convert to local
  const doctorFromTime = moment.utc(doctor.fromTime).local();
  const doctorToTime = moment.utc(doctor.toTime).local();

  // Extract hours and minutes only (now in local time)
  const doctorFromHour = doctorFromTime.hours();
  const doctorFromMinute = doctorFromTime.minutes();
  const doctorToHour = doctorToTime.hours();
  const doctorToMinute = doctorToTime.minutes();

  console.log(`Doctor working hours: ${doctorFromHour}:${doctorFromMinute} to ${doctorToHour}:${doctorToMinute}`);

  // Parse the appointment time - also UTC, convert to local
  const appointmentTime = moment.utc(time).local();

  if (!appointmentTime.isValid()) {
    return next(new AppError("Invalid time format provided", 400));
  }

  // Extract hours and minutes from appointment time (now in local time)
  const appointmentHour = appointmentTime.hours();
  const appointmentMinute = appointmentTime.minutes();

  console.log(`New appointment time: ${appointmentHour}:${appointmentMinute}`);

  // Parse the date
  const parsedDate = moment.utc(date).local();

  if (!parsedDate.isValid()) {
    return next(new AppError("Invalid date format provided", 400));
  }

  const formattedDate = parsedDate.format("YYYY-MM-DD");
  console.log("New appointment date:", formattedDate);

  // Check if the date is in the past
  const today = moment().startOf('day');
  const appointmentDate = moment(formattedDate).startOf('day');

  if (appointmentDate.isBefore(today)) {
    return next(new AppError("Cannot reschedule appointments to past dates", 400));
  }

  // Convert to minutes since midnight for accurate comparison
  const appointmentMinutes = appointmentHour * 60 + appointmentMinute;
  const doctorFromMinutes = doctorFromHour * 60 + doctorFromMinute;
  const doctorToMinutes = doctorToHour * 60 + doctorToMinute;

  console.log("Appointment minutes since midnight:", appointmentMinutes);
  console.log("Doctor from minutes since midnight:", doctorFromMinutes);
  console.log("Doctor to minutes since midnight:", doctorToMinutes);

  // Format for display
  const displayFromTime = moment().hours(doctorFromHour).minutes(doctorFromMinute).format("hh:mm A");
  const displayToTime = moment().hours(doctorToHour).minutes(doctorToMinute).format("hh:mm A");

  console.log(`Display times: ${displayFromTime} to ${displayToTime}`);

  // Check if appointment time is within doctor's working hours
  if (
    appointmentMinutes < doctorFromMinutes ||
    appointmentMinutes > doctorToMinutes
  ) {
    console.log("❌ Appointment time is outside working hours");
    return next(
      new AppError(
        `Please select a time within the doctor's working hours ${displayFromTime} to ${displayToTime}`,
        400
      )
    );
  }

  console.log("✅ Appointment time is within working hours");

  // Check if the selected time slot is already booked (excluding current appointment)
  const appointments = await Appointment.find({
    doctorId: appointment.doctorId,
    date: formattedDate,
    status: { $ne: "rejected" },
    _id: { $ne: appointmentId }, // Exclude current appointment
  });

  console.log(`Found ${appointments.length} existing appointments for this date`);

  // Check if the selected time slot is already booked
  const isSlotAvailable = !appointments.some((appt) => {
    const apptMoment = moment(appt.time);
    const slotHour = apptMoment.hours();
    const slotMinute = apptMoment.minutes();
    const slotStartMinutes = slotHour * 60 + slotMinute;
    const slotEndMinutes = slotStartMinutes + 30; // 30 min consultation time

    const requestedStartMinutes = appointmentMinutes - 30; // 30 min before
    const requestedEndMinutes = appointmentMinutes + 15; // 15 min after

    console.log(`Checking slot: ${slotHour}:${slotMinute} (${slotStartMinutes}-${slotEndMinutes} mins) vs requested (${requestedStartMinutes}-${requestedEndMinutes} mins)`);

    // Check for overlap
    const hasOverlap = requestedStartMinutes < slotEndMinutes &&
      requestedEndMinutes > slotStartMinutes;

    if (hasOverlap) {
      console.log("❌ Slot conflict detected");
    }

    return hasOverlap;
  });

  if (!isSlotAvailable) {
    console.log("❌ Appointment slot not available");
    return next(new AppError("Appointment slot not available", 400));
  }

  console.log("✅ Appointment slot is available");

  // Save reschedule history
  appointment.rescheduleHistory.push({
    previousDate: appointment.date,
    previousTime: appointment.time,
    newDate: formattedDate,
    newTime: time,
    rescheduledBy: "doctor",
    rescheduledAt: new Date(),
    reason: "Doctor rescheduled the appointment",
  });

  // Store original date and time if not already stored
  if (!appointment.originalDate) {
    appointment.originalDate = appointment.date;
    appointment.originalTime = appointment.time;
  }

  // Update appointment with new date and time
  appointment.date = formattedDate;
  appointment.time = time;
  appointment.status = "rescheduled";
  appointment.rescheduledBy = req.user._id;
  appointment.rescheduledAt = new Date();

  await appointment.save();

  // Find user and send notification
  const user = await User.findById(appointment.userId);

  const unseenNotifications = user.unseenNotifications;
  unseenNotifications.push({
    type: "appointment-rescheduled",
    message: `Your appointment has been rescheduled to ${formattedDate} at ${moment.utc(time).local().format("hh:mm A")}`,
    data: {
      name: user.name,
      appointmentId: appointment._id,
    },
    onClickPath: "/appointments",
  });

  await user.save();

  // Send real-time notification
  const io = req.app.get("io");
  if (io) {
    io.to(user._id.toString()).emit("new-notification", {
      type: "appointment-rescheduled",
      message: `Your appointment has been rescheduled to ${formattedDate} at ${moment.utc(time).local().format("hh:mm A")}`,
    });
  }

  res.status(200).send({
    status: true,
    message: "Appointment rescheduled successfully",
    data: appointment,
  });
});

exports.markAsNoShow = catchAsync(async (req, res, next) => {
  const { appointmentId } = req.body;

  // Validate required field
  if (!appointmentId) {
    return next(new AppError("Appointment ID is required", 400));
  }

  // Find the appointment
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Only approved appointments can be marked as no-show
  if (appointment.status !== "approved") {
    return next(new AppError("Only approved appointments can be marked as no-show", 400));
  }

  // Update status to no-show
  appointment.status = "no-show";
  await appointment.save();

  res.status(200).send({
    status: true,
    message: "Appointment marked as no-show successfully",
    data: appointment,
  });
});
