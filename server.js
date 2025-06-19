// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const twilio = require('twilio');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve frontend from /public folder

// Twilio credentials from .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_WHATSAPP_FROM; 
const contentSid = process.env.TWILIO_TEMPLATE_SID;
const voiceCallerId = process.env.TWILIO_CALLER_ID; 
const agentNumber = process.env.AGENT_NUMBER; 
const baseUrl = process.env.BASE_URL; 

const voiceClient = twilio(accountSid, authToken);

// ✅ WhatsApp Template Message
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

// ✅ Start a Voice Call
app.post('/start-call', async (req, res) => {
  const { customerNumber } = req.body;

  try {
    const call = await voiceClient.calls.create({
      to: customerNumber,
      from: voiceCallerId,
      url: `${baseUrl}/voice.xml`
    });

    res.json({ success: true, sid: call.sid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ TwiML to Connect Customer to Agent
app.post('/voice.xml', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say('Please wait while we connect you to an agent.');
  twiml.dial(agentNumber);
  res.type('text/xml');
  res.send(twiml.toString());
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
