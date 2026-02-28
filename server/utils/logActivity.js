const SystemActivity = require("../models/systemActivityModel");

const logActivity = async (req, action, details) => {
    try {
        // Ensure user is authenticated before logging
        if (!req.user || !req.user._id) return;

        await SystemActivity.create({
            user: req.user._id,
            action,
            details,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get("User-Agent"),
        });
    } catch (error) {
        console.error("Error logging activity:", error);
        // Don't block the main request flow if logging fails
    }
};

module.exports = logActivity;
