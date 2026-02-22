// server.js

const express = require("express");
const axios = require("axios");

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Basic health check
app.get("/", (req, res) => {
  res.send("Admissions assistant is running.");
});

// Ultramsg credentials (set these in Railway → Variables)
const ULTRAMSG_INSTANCE_ID = process.env.ULTRAMSG_INSTANCE_ID;
const ULTRAMSG_TOKEN = process.env.ULTRAMSG_TOKEN;

// Helper: send WhatsApp message via Ultramsg
async function sendWhatsAppMessage(to, body) {
  if (!ULTRAMSG_INSTANCE_ID || !ULTRAMSG_TOKEN) {
    console.error("Ultramsg credentials are missing");
    return;
  }

  const url = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/chat`;

  try {
    const response = await axios.post(url, {
      token: ULTRAMSG_TOKEN,
      to,
      body,
    });
    console.log("Ultramsg response:", response.data);
  } catch (error) {
    console.error("Error sending WhatsApp message:", error?.response?.data || error.message);
  }
}

// Simple in‑memory state (per phone number)
const userState = {}; // { [phone]: { step: number, data: {...} } }

// Webhook endpoint for Ultramsg
app.post("/webhook", async (req, res) => {
  try {
    console.log("Incoming webhook:", JSON.stringify(req.body, null, 2));

    // Ultramsg usually sends fields like: from, body, type, etc.
    const from = req.body?.from || req.body?.sender || null;
    const messageBody = req.body?.body || req.body?.message || null;

    // Always respond 200 quickly so Ultramsg doesn't retry
    res.status(200).send("OK");

    if (!from || !messageBody) {
      console.log("Missing 'from' or 'body' in webhook payload");
      return;
    }

    // Normalize phone (Ultramsg often sends like "2609xxxxxxx")
    const phone = from;

    // Initialize state if new user
    if (!userState[phone]) {
      userState[phone] = { step: 1, data: {} };
    }

    const state = userState[phone];
    const text = String(messageBody).trim();

    // Simple admissions flow
    if (state.step === 1) {
      // First contact
      await sendWhatsAppMessage(phone, "Hello! What is your full name?");
      state.step = 2;
      return;
    }

    if (state.step === 2) {
      state.data.fullName = text;
      await sendWhatsAppMessage(phone, "Great, thanks. What program are you interested in?");
      state.step = 3;
      return;
    }

    if (state.step === 3) {
      state.data.program = text;
      await sendWhatsAppMessage(
        phone,
        `Thanks, ${state.data.fullName}. We’ve recorded your interest in ${state.data.program}. An admissions officer will follow up with you shortly.`
      );
      // Optionally reset or keep state
      state.step = 1;
      return;
    }

    // Fallback
    await sendWhatsAppMessage(
      phone,
      "Welcome to the admissions assistant. Please say 'Hi' to begin."
    );
    state.step = 1;
  } catch (error) {
    console.error("Webhook handler error:", error);
    // We already sent res.status(200), so just log
  }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
