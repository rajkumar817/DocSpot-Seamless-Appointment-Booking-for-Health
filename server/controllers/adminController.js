const catchAsync = require("../utils/catchAsync");
const SystemActivity = require("../models/systemActivityModel");

exports.getSystemActivity = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await SystemActivity.find()
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await SystemActivity.countDocuments();

    res.status(200).json({
        status: "success",
        results: logs.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        data: logs,
    });
});
