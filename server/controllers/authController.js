const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");
const logActivity = require("../utils/logActivity");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET); // Removed expiresIn
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // Check if there are any users in the database
  const userCount = await User.countDocuments();

  // Determine if the current user being added is the first user
  const isAdmin = userCount === 0;

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password,
    gender: req.body.gender,
    dateOfBirth: req.body.dateOfBirth,
    address: req.body.address,
    bloodGroup: req.body.bloodGroup,
    isAdmin,
  });

  req.user = newUser; // Set user for logger
  await logActivity(req, "Signup", `New user ${newUser.name} registered`);
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password, role } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");
  const correct = await user && await user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) Check if user role matches the login type
  if (role) {
    if (role === 'admin' && !user.isAdmin) {
      return next(new AppError("Access denied. You are not an Admin.", 403));
    }
    if (role === 'doctor' && !user.isDoctor) {
      return next(new AppError("Access denied. You are not a Doctor.", 403));
    }
    // Strict check for users: must NOT be admin or doctor
    if (role === 'user' && (user.isAdmin || user.isDoctor)) {
      return next(new AppError("Access denied. Please login using your specific role page.", 403));
    }
  }

  // 4) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        "The user belonging to this token no longer exists.",
        401
      )
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Please provide your email address", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("No user found with that email address", 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send token in response (for manual reset without email)
  res.status(200).json({
    status: "success",
    message: "Password reset token generated successfully",
    resetToken,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(new AppError("Please provide token and new password", 400));
  }

  // 1) Get user based on the token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'doctor']. role='user'
    let allowed = false;
    if (roles.includes("admin") && req.user.isAdmin) allowed = true;
    if (roles.includes("doctor") && req.user.isDoctor) allowed = true;

    // special case if we just want to check if they are a 'user' (not admin/doctor specific, but just authenticated which is handled by protect, but if we want to explicitly restrict to roles)
    // In this app, roles seems to be boolean flags on the user model (isAdmin, isDoctor). 
    // The previous login logic checked: role === 'admin' && user.isAdmin.

    // customized for this specific app's user model structure
    if (!allowed) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};
