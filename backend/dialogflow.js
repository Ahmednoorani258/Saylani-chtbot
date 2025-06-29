const dialogflow = require("@google-cloud/dialogflow");
const nodemailer = require("nodemailer");
const { WebhookClient, Suggestion } = require("dialogflow-fulfillment");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const runGeminiChat = require("./services/gemini");
const connectToMongoDB = require("./db/mongoose");
const app = express();

connectToMongoDB();
app.use(express.json());
app.use(cors());

// ✅ Setup email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/webhook", require("./webhook/index") ,async (req, res) => {
  var id = res.req.body.session.substr(43);
  console.log(id);
  const agent = new WebhookClient({ request: req, response: res });

  function hi(agent) {
    console.log(`intent  =>  hi`);
    agent.add("hello from server");
  }

  async function registration(agent) {
    const { studentname, fathername, coursename, email, contact, cnic } = agent.parameters;
  
    // ✅ Immediately respond to Dialogflow to avoid timeout
    agent.add(`✅ Thank you, ${studentname.name}. You're registered for the ${coursename} course!`);
    agent.add(`📧 A confirmation email will be sent to ${email}`);
  
    // ✅ Run heavy tasks separately so Dialogflow doesn't wait
    setTimeout(async () => {
      try {
        // Send email
        const info = await transporter.sendMail({
          from: '"Saylani" <ahmednoorani258@gmail.com>',
          to: email,
          subject: "Registration Confirmation",
          html: `<p>Hello ${studentname.name},<br>You are registered for <strong>${coursename}</strong>. Thank you!</p>`,
        });
        console.log("✅ Email sent:", info.messageId);
  
        // Send WhatsApp
        const message = await client.messages.create({
          from: "whatsapp:+14155238886",
          body: `Hello ${studentname.name}, you're registered for ${coursename}. Confirmation sent to ${email}.`,
          to: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`, // Format: whatsapp:+92xxxxxx
        });
        console.log("✅ WhatsApp sent:", message.sid);
      } catch (error) {
        console.error("❌ Error sending email or WhatsApp:", error);
      }
    }, 0); // 🚀 async task after response
  }

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

  async function fallback(agent) {
    try {
      const action = req.body.queryResult.action;
      const queryText = req.body.queryResult.queryText;

      if (action === "input.unknown") {
        const response = await runGeminiChat(queryText);
        agent.add(response);
        console.log("Gemini:", response);
      } else {
        agent.add("Sorry, I couldn't understand. Please rephrase.");
      }
    } catch (err) {
      console.error("Fallback error:", err);
      agent.add("There was a problem getting a response. Please try again.");
    }
  }

  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", hi);
  intentMap.set("IT_Registration_Start", registration);
  intentMap.set("Default Fallback Intent", fallback);
  agent.handleRequest(intentMap);
});
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
