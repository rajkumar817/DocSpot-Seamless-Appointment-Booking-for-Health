const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const Appointment = require("../models/appointmentModel");
const AppError = require("../utils/appError");
const moment = require("moment");
const Doctor = require("../models/doctorModel");
const logActivity = require("../utils/logActivity");

exports.verifyUser = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "User verified successfully.",
    data: req.user,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  const filteredUsers = users.map((user) => {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      isAdmin: user.isAdmin,
      isDoctor: user.isDoctor,
    };
  });

  res.status(200).json({
    status: "success",
    message: "Users fetched successfully.",
    data: filteredUsers,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    status: "success",
    message: "User fetched successfully.",
    data: user,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { name, email, phoneNumber, gender, dateOfBirth, address, bloodGroup } = req.body;
  const userId = req.params.id;
  const requestingUser = req.user;

  // Only allow the user themselves to update (or admin if necessary, but typically users update their own profile)
  // Let's allow admin too just in case an admin needs to correct data
  if (requestingUser._id.toString() !== userId && !requestingUser.isAdmin) {
    return next(new AppError("You do not have permission to update this user", 403));
  }

  // Validate required fields
  if (!name || !email || !phoneNumber) {
    return next(new AppError("Please provide name, email, and phone number", 400));
  }

  // Check if email is already taken by another user
  if (email) {
    const existingUserWithEmail = await User.findOne({
      email,
      _id: { $ne: userId }
    });
    if (existingUserWithEmail) {
      return next(new AppError("Email is already in use", 400));
    }
  }

  // Check if phone number is already taken by another user
  if (phoneNumber) {
    const existingUserWithPhone = await User.findOne({
      phoneNumber,
      _id: { $ne: userId }
    });
    if (existingUserWithPhone) {
      return next(new AppError("Phone number is already in use", 400));
    }
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name, email, phoneNumber, gender, dateOfBirth, address, bloodGroup },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  // Remove password from response
  updatedUser.password = undefined;

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: updatedUser,
  });
});


exports.bookAppointment = catchAsync(async (req, res, next) => {
  // Check if user is a doctor - doctors should not be able to book appointments
  if (req.user.isDoctor) {
    return next(new AppError("Doctors are not allowed to book appointments", 403));
  }

  // FORCE userId from the logged-in user to ensure consistency
  req.body.userId = req.user._id;

  req.body.status = "pending";
  req.body.date = moment(req.body.date);
  req.body.time = moment(req.body.time);

  const newAppointment = new Appointment(req.body);
  await newAppointment.save();

  // Find doctor and send notification
  const user = await User.findById(req.body.doctorInfo.userId);
  user.unseenNotifications.push({
    type: "new-appointment-request",
    message: `A new appointment request has been made by ${req.body.userInfo.name}`,
    data: {
      name: req.body.userInfo.name,
    },
    onClickPath: "/doctor/appointments",
  });
  await user.save();

  // Send real-time notification
  const io = req.app.get("io");
  if (io) {
    io.to(user._id.toString()).emit("new-notification", {
      type: "new-appointment-request",
      message: `A new appointment request has been made by ${req.body.userInfo.name}`,
    });
  }

  await logActivity(req, "Book Appointment", `User booked appointment with Dr. ${req.body.doctorInfo.firstName} ${req.body.doctorInfo.lastName} on ${req.body.date} at ${req.body.time}`);

  res.status(200).json({
    status: "success",
    message: "Appointment booked successfully.",
  });
});

exports.userAppointments = catchAsync(async (req, res, next) => {
  // Use req.user._id to ensure we fetch appointments for the logged-in user
  const appointments = await Appointment.find({
    userId: req.user._id,
  });

  res.status(200).json({
    status: "success",
    message: "Appointments fetched successfully.",
    data: appointments,
  });
});

exports.cancelAppointment = catchAsync(async (req, res, next) => {
  const { appointmentId, cancellationReason } = req.body;

  // Validate required fields
  if (!appointmentId) {
    return next(new AppError("Appointment ID is required", 400));
  }

  if (!cancellationReason || cancellationReason.trim().length < 10) {
    return next(new AppError("Cancellation reason is required (minimum 10 characters)", 400));
  }

  // Find the appointment
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Only approved appointments can be cancelled by patient
  if (appointment.status !== "approved") {
    return next(new AppError("Only approved appointments can be cancelled", 400));
  }

  // Check 12-hour restriction
  const appointmentDateTime = new Date(`${appointment.date}T${new Date(appointment.time).toISOString().split('T')[1]}`);
  const currentTime = new Date();
  const hoursDifference = (appointmentDateTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);

  if (hoursDifference < 12) {
    return next(new AppError("Cannot cancel appointment within 12 hours of scheduled time", 400));
  }

  // Update appointment status to rejected (cancelled)
  appointment.status = "rejected";
  appointment.cancellationReason = cancellationReason.trim();
  appointment.cancelledBy = "patient";
  await appointment.save();

  await logActivity(req, "Cancel Appointment", `User cancelled appointment ${appointmentId}. Reason: ${cancellationReason}`);

  res.status(200).send({
    status: true,
    message: "Appointment cancelled successfully",
    data: appointment,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const requestingUser = req.user;

  // Only allow admin or the user themselves to delete
  if (requestingUser._id.toString() !== userId && !requestingUser.isAdmin) {
    return next(new AppError("You do not have permission to delete this user", 403));
  }

  // 1) Find USer Delete User
  await User.findByIdAndDelete(userId);
  // 2) Delete Doctor
  await Doctor.findOneAndDelete({ userId });
  // 3) Delete associated appointments
  await Appointment.deleteMany({ doctorId: userId });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.notificationSeen = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const unseenNotifications = user.unseenNotifications;
  user.seenNotifications = unseenNotifications;

  user.unseenNotifications = [];

  const updatedUser = await user.save();
  updatedUser.password = undefined;

  res.status(200).send({
    status: true,
    message: "All notifications seen",
    data: updatedUser,
  });
});

exports.deleteNotifications = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  user.seenNotifications = [];
  user.unseenNotifications = [];

  const updatedUser = await user.save();
  updatedUser.password = undefined;

  res.status(200).send({
    status: true,
    message: "All notifications deleted",
    data: updatedUser,
  });
});

exports.doctorStatus = catchAsync(async (req, res, next) => {
  const { doctorId, status, userId } = req.body;

  const doctor = await Doctor.findByIdAndUpdate(doctorId, { status });
  if (!doctor) return next(new AppError("Doctor not found", 404));

  // Send Notification To User
  const user = await User.findById(userId);
  const unseenNotifications = user.unseenNotifications;
  unseenNotifications.push({
    type: "new-doctor-request-changed",
    message: `Your doctor request has been ${status}`,
    data: {
      name: user.name,
      doctorId: user._id,
    },
    onClickPath: "/notifications",
  });
  user.isDoctor = status === "approved" ? true : false;
  await user.save();

  // Send real-time notification
  const io = req.app.get("io");
  if (io) {
    io.to(user._id.toString()).emit("new-notification", {
      type: "new-doctor-request-changed",
      message: `Your doctor request has been ${status}`,
    });
  }

  const doctors = await Doctor.find();

  res.status(200).send({
    status: true,
    message: "Doctor status changed successfully",
    data: doctors,
  });
});

exports.uploadAppointmentDocuments = catchAsync(
  async (req, res, next) => {
    const { appointmentId, documents } = req.body;

    // Validate appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return next(new AppError("Appointment not found", 404));
    }

    // Validate documents array
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return next(new AppError("Please provide documents to upload", 400));
    }

    // Validate file size (max 5MB per file)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    for (const doc of documents) {
      if (doc.fileData) {
        const fileBuffer = Buffer.from(doc.fileData, "base64");
        if (fileBuffer.length > MAX_FILE_SIZE) {
          return next(
            new AppError(
              `File ${doc.fileName} exceeds maximum size of 5MB`,
              400
            )
          );
        }
      }
    }

    // Update appointment with documents
    appointment.documents = documents;
    await appointment.save();

    res.status(200).json({
      status: "success",
      message: "Documents uploaded successfully",
      data: appointment,
    });
  }
);
