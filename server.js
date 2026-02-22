import express from "express";
import { sendMessage } from "./ultramsg.js";
import { handleFlow } from "./flow.js";

const app = express();
app.use(express.json());

let sessions = {};

app.post("/webhook", async (req, res) => {
  const { from, body } = req.body;

  if (!sessions[from]) {
    sessions[from] = {};
  }

  const result = handleFlow(sessions[from], body);

  sessions[from] = result.state;

  await sendMessage(from, result.reply);

  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("Admissions assistant is running.");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port", port));
