const mongoose = require("mongoose");
const colors = require("colors");
const { Server } = require("socket.io");
require("dotenv").config();
// Custom Imports
const app = require("./app");
const connectDB = require("./config/connect");
const initializeSocketHandlers = require("./socketHandlers");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);

  process.exit(1);
});

// Connect to Database
connectDB();

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(colors.yellow(`Server is running on port ${port}`));
});

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize socket event handlers
initializeSocketHandlers(io);
app.set("io", io); // Attach io to app
console.log(colors.green("Socket.IO initialized successfully"));

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
