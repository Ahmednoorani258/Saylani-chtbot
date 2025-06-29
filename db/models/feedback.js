const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  message: String,
  summary: String,
  createdAt: Date,
});

module.exports = mongoose.model("Feedback", feedbackSchema);
