const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE);

    console.log(
      colors.cyan.underline(`MongoDB Connected: ${conn.connection.host}`)
    );
    return conn;
  } catch (error) {
    console.log(colors.red(`Error in MongoDB: ${error.message}`));
    process.exit(1);
  }
};

module.exports = connectDB;
