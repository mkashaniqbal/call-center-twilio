// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Optional: serve frontend

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_WHATSAPP_FROM;
const contentSid = process.env.TWILIO_TEMPLATE_SID;

app.post('/send-message', async (req, res) => {
  const { to, name, order, location } = req.body;

  try {
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      new URLSearchParams({
        To: `whatsapp:${to}`,
        From: twilioNumber,
        ContentSid: contentSid,
        ContentVariables: JSON.stringify({
          "1": name,
          "2": order,
          "3": location
        })
      }),
      {
        auth: {
          username: accountSid,
          password: authToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    res.json({ sid: response.data.sid });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
