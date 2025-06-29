const User = require("../db/models/user");

module.exports = async function handleWebhook(req, res) {
  const intent = req.body.queryResult.intent.displayName;

  if (intent === "IT_Registration_Start") {
    // Sample static data (replace with actual entities if set up)
    const params = req.body.queryResult.parameters;
    const studentname = params.studentname.name;  // You can extract from parameters later
    const fathername = params.fathername.name;
    const contact = params.contact;
    const email = params.email;
    const coursename = params.coursename;
    const cnic = params.cnic;

    try {
      const user = new User({ studentname, fathername, cnic, contact, email, coursename });
      await user.save();

      res.json({
        fulfillmentText: `✅ Thank you, ${studentname}. You are registered for the ${coursename} course!`,
      });
    } catch (error) {
      console.error("❌ Error saving user:", error);
      res.json({
        fulfillmentText: "❌ Sorry, there was a problem saving your registration.",
      });
    }   
  } else {
    res.json({
      fulfillmentText: "🤖 I'm not sure how to handle this intent yet.",
    });
  }
};
