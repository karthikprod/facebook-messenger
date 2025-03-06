const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "your_verify_token";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || "your_page_access_token";

app.use(bodyParser.json());

// 1️⃣ Facebook Webhook Verification (Step 3: Verify Token)
app.get('/webhook/messenger', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log("WEBHOOK VERIFIED!");
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// 2️⃣ Handle Incoming Messages
app.post('/webhook/messenger', (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            const event = entry.messaging[0];

            if (event.message && event.sender) {
                const senderId = event.sender.id;
                const messageText = event.message.text;
                console.log(`📩 New Message from ${senderId}: ${messageText}`);

                // Send automatic reply
                sendMessage(senderId, `You said: ${messageText}`);
            }
        });
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

// 3️⃣ Function to Send Messages
function sendMessage(recipientId, message) {
    axios.post(`https://graph.facebook.com/v13.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
        recipient: { id: recipientId },
        message: { text: message }
    }).then(response => {
        console.log(`✅ Message sent to ${recipientId}`);
    }).catch(error => {
        console.error("❌ Error sending message:", error.response.data);
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
