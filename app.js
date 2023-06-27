const express = require("express");
require("dotenv").config();
const { google } = require("googleapis");
const bodyParser = require("body-parser");
const opn = require("opn");

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

// handle auth callback
app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  res.send("authentication successful! you can close this tab.");
});

// handle login
app.get("/login", (req, res) => {
  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
  });
  opn(authorizeUrl);
  res.send("please check your browser to login...");
});

// start the server
app.listen(3000, () => {
  console.log("server is running on port 3000");
});
