const mongoose = require("mongoose");

const systemActivitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        details: {
            type: String,
            required: true,
        },
        ipAddress: {
            type: String,
            default: "",
        },
        userAgent: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

const SystemActivity = mongoose.model("SystemActivity", systemActivitySchema);
module.exports = SystemActivity;
