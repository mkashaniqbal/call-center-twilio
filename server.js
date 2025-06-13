const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve frontend

// 🔐 Replace with your actual Twilio credentials
const accountSid = 'AC13a8eb7fc3bf02255faee455aad81d82';
const authToken = '3d4885a297396c029d07502fb36e3425';
const twilioNumber = 'whatsapp:+5493541628808'; // Example: whatsapp:+5493541628808
const contentSid = 'HXc73acb29580e7bda999b949d369e157f'; // This is your approved WhatsApp template SID

app.post('/send-message', async (req, res) => {
  const { to, name, order } = req.body;

  try {
    const response = await axios.post(
      'https://api.twilio.com/2010-04-01/Accounts/AC13a8eb7fc3bf02255faee455aad81d82/Messages.json',
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

app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
