import axios from "axios";

const instanceId = process.env.INSTANCE_ID;
const token = process.env.ULTRAMSG_TOKEN;

export async function sendMessage(to, body) {
  const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;

  try {
    await axios.post(url, {
      token,
      to,
      body
    });
  } catch (error) {
    console.error("Error sending message:", error.response?.data || error.message);
  }
}
