const { GoogleGenerativeAI } = require("@google/generative-ai"); // Gemini SDK
const Feedback = require("../db/models/Feedback"); // Your MongoDB schema

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function handleFeedback(req, res) {
  const feedbackText = req.body.queryResult.queryText;

  // Analyze feedback using Gemini
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(`Summarize and classify this user feedback: "${feedbackText}"`);
  const summary = result.response.text();

  // Save to MongoDB
  const feedback = new Feedback({
    message: feedbackText,
    summary,
    createdAt: new Date()
  });
  await feedback.save();

  res.json({
    fulfillmentText: "Thanks for your feedback! We’ll use it to improve."
  });
}

module.exports = handleFeedback;
