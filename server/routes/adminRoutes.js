const express = require("express");
const adminController = require("../controllers/adminController");
const authController = require("../controllers/authController");

const router = express.Router();

// Protect all routes
router.use(authController.protect);

// Restrict all routes to admin
router.use((req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({
            status: "fail",
            message: "You do not have permission to perform this action",
        });
    }
    next();
});

router.get("/system-activity", adminController.getSystemActivity);

module.exports = router;
