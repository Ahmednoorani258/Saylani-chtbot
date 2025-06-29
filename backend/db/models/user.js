const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  studentname: String,
  fathername: String,
  cnic: String,
  contact: String,
  email: String,
  coursename: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
