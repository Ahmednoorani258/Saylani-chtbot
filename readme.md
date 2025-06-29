# 🤖 Saylani Dialogflow Chatbot – Grand Test Project

This is a fully functional Dialogflow ES chatbot created for Saylani Mass IT Training's Grand Test assignment. It handles student registration, FAQs, Roti Bank information, feedback via Gemini AI, and appointment scheduling using Calendly.

---

## 📦 Features

### 🎓 IT Course Registration
- Takes student name, father name, CNIC, contact number, email, and course name
- Sends a **digital ID card** to the student via **email**
- Sends confirmation message via **WhatsApp (Twilio)**

### 🧠 Gemini Fallback
- AI-powered fallback using **Google Gemini Pro API**
- Handles open-ended or unknown questions dynamically

### ❓ FAQ System
- Built with either **Dialogflow intents** or **Knowledgebase**
- Handles questions like "What is freelancing?" or "What courses are available?"

### 🍞 Roti Bank Module
- Answers about donation, locations, and food services provided by Saylani
- Intent-based responses for user-friendly interaction

### 📅 Calendly Integration
- Users can book appointments via a **Calendly link**
- Triggered with phrases like “I want to schedule a call”

---

## 🚀 Tech Stack

| Layer        | Tool                  |
|--------------|-----------------------|
| Chat Platform | Dialogflow ES         |
| Webhook      | Node.js + Express      |
| Email        | Nodemailer (Gmail SMTP)|
| WhatsApp     | Twilio API             |
| AI           | Gemini Pro API (Google)|
| Deployment   | Railway.app            |


