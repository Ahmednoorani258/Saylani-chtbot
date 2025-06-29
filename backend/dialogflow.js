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
const app = express();
app.use(express.json());
app.use(cors());

function randomnumbgn() {
  //generate 6 digit random number
  return Math.floor(Math.random() * 900000) + 100000;
}


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

app.post("/webhook" ,async (req, res) => {
  var id = res.req.body.session.substr(43);
  console.log(id);
  const agent = new WebhookClient({ request: req, response: res });

  function hi(agent) {
    console.log(`intent  =>  hi`);
    agent.add("hello from server");
  }

  function registration(agent) {
    const { studentname, fathername, coursename, email, contact, cnic } = agent.parameters;

    // ✅ Respond to Dialogflow within 5 seconds
    agent.add(`✅ Thank you, ${studentname.name}. Your registration for ${coursename} is complete.`);
    agent.add(`📧 Confirmation will be sent to: ${email}`);
    agent.add(`📱 Contact: ${contact}, CNIC: ${cnic}, Father's Name: ${fathername}`);

    // 🚀 Background email + WhatsApp sending
    setTimeout(async () => {
      try {
        // send email
        const info = await transporter.sendMail({
          from: '"Saylani IT" <ahmednoorani258@gmail.com>',
          to: email,
          subject: "Registration Confirmation",
          html: `<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; padding: 30px;">
  <table align="center" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; margin: auto;">
    <tr>
      <!-- Front Side -->
      <td style="vertical-align: top; padding: 10px;">
        <div style="width: 100%; max-width: 270px; height: 420px; border-radius: 12px; overflow: hidden; border: 1px solid #ccc; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin: auto;">
          <div style="width: 100%; height: 60px; background: linear-gradient(90deg, #004aad, #45c62d);"></div>
          <div style="text-align: center; margin-top: -30px;">
            <img src="https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(
              studentname.name
            )}" alt="Profile" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid #004aad; background: #fff;">
            <h2 style="margin: 10px 0 5px; font-size: 18px; color: #004aad;">${studentname.name}</h2>
            <p style="font-size: 14px; color: #555;">${coursename}</p>
            <p style="font-weight: bold; margin-top: 5px; color: #222;">GD-${randomnumbgn()}</p>
          </div>
          <div style="margin-top: auto; width: 100%; text-align: center; background: #e5f2ff; padding: 10px; font-size: 12px; font-weight: bold; color: #004aad;">
            SAYLANI MASS IT TRAINING PROGRAM
          </div>
          <div style="width: 100%; height: 30px; background: linear-gradient(to right, #004aad, #45c62d);"></div>
        </div>
      </td>

      <!-- Back Side -->
      <td style="vertical-align: top; padding: 10px;">
        <div style="width: 100%; max-width: 270px; height: 420px; border-radius: 12px; overflow: hidden; border: 1px solid #ccc; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin: auto;">
          <div style="width: 100%; height: 60px; background: linear-gradient(90deg, #004aad, #45c62d);"></div>
          <div style="padding: 20px; font-size: 14px; color: #333;">
            <p><strong>Name:</strong> ${studentname.name}</p>
            <p><strong>Father's Name:</strong> ${fathername}</p>
            <p><strong>CNIC:</strong> ${cnic}</p>
            <p><strong>Course:</strong> ${coursename}</p> 
            <div style="text-align: center; margin-top: 20px;">
              <img src="https://api.qrserver.com/v1/create-qr-code/?data=SMIT&size=100x100" alt="QR Code" style="border: 1px solid #ccc; padding: 5px;">
            </div>
            <p style="font-size: 11px; margin-top: 15px; text-align: center; color: #666;"><strong>Note:</strong> This card is valid only within SMIT premises. Please return if found.</p>
          </div>
          <div style="width: 100%; height: 30px; background: linear-gradient(to right, #004aad, #45c62d); text-align: center; color: white; font-size: 12px; line-height: 30px;">
            Issuing Authority - SMIT
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
`, // HTML body,
        });
        console.log("✅ Email sent:", info.messageId);

        // send WhatsApp
        const message = await client.messages.create({
          from: "whatsapp:+14155238886",
          body: `Hello ${studentname.name}, you're registered for "${coursename}". Confirmation sent to ${email}.`,
          to: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        });
        console.log("✅ WhatsApp sent:", message.sid);
      } catch (error) {
        console.error("❌ Background task failed:", error);
      }
    }, 0);
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
  await agent.handleRequest(intentMap);
});
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
