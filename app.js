const express = require("express");
require("dotenv").config();
const { google } = require("googleapis");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// create OAuth2 client
const { OAuth2 } = google.auth;
const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "http://localhost:3000/auth/callback"
);

// create gmail client
const gmail = google.gmail({
  version: "v1",
  auth: oauth2Client,
});

// handle gmail notifications
app.post("/webhook", async (req, res) => {
  try {
    const { messageId } = req.body;

    // retrieve emails using google api
    const email = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
    });
    const { from, subject, snippet } = email.data;

    console.log("received an email:", {
      from,
      subject,
      snippet,
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("error handling Gmail notification:", error);
    res.sendStatus(500);
  }
});

// start the server
app.listen(3000, () => {
  console.log("server is running on port 3000");
});
