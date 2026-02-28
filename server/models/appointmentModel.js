const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "Please provide User Id"],
    },
    doctorId: {
      type: String,
      required: [true, "Please provide Doctor Id"],
    },
    userInfo: {
      type: Object,
      required: [true, "Please provide User details"],
    },
    doctorInfo: {
      type: Object,
      required: [true, "Please provide Doctor details"],
    },
    date: {
      type: String,
      required: [true, "Please provide date"],
    },
    time: {
      type: String,
      required: [true, "Please provide time"],
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
    documents: [
      {
        fileName: {
          type: String,
        },
        fileType: {
          type: String,
        },
        fileSize: {
          type: Number,
        },
        fileData: {
          type: String, // Base64 encoded file data
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    consultationNotes: {
      type: String,
      default: "",
    },
    prescription: {
      type: String,
      default: "",
    },
    medicalRecords: [
      {
        fileName: {
          type: String,
        },
        fileType: {
          type: String,
        },
        fileSize: {
          type: Number,
        },
        fileData: {
          type: String, // Base64 encoded PDF data
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        uploadedBy: {
          type: String,
        },
      },
    ],
    originalDate: {
      type: String,
    },
    originalTime: {
      type: String,
    },
    rescheduledBy: {
      type: String,
    },
    rescheduledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor'],
      default: null,
    },
    rescheduleHistory: [
      {
        previousDate: {
          type: String,
        },
        previousTime: {
          type: String,
        },
        newDate: {
          type: String,
        },
        newTime: {
          type: String,
        },
        rescheduledBy: {
          type: String,
        },
        rescheduledAt: {
          type: Date,
          default: Date.now,
        },
        reason: {
          type: String,
          default: "",
        },
      },
    ],
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = new mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
