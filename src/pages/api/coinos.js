// pages/api/coinos.js
import axios from "axios";

// Base Coinos API URL
const COINOS_API_URL = "https://coinos.io/api";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action } = req.body;

  try {
    switch (action) {
      case "register":
        return await handleRegister(req, res);
      case "login":
        return await handleLogin(req, res);
      // Add more cases here for additional API functions
      case "createInvoice":
        return await handleCreateInvoice(req, res);
      case "sendBitcoin":
        return await handleSendBitcoin(req, res);
      default:
        return res.status(400).json({ error: "Invalid or missing action" });
    }
  } catch (error) {
    console.error(`Error in ${action || "API"} action:`, error);
    return res.status(500).json({
      error: "An unexpected error occurred",
      details: error.message,
    });
  }
}

// Handler for user registration
async function handleRegister(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    const response = await axios.post(
      `${COINOS_API_URL}/register`,
      {
        user: {
          username,
          password,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(error.response?.status || 500).json({
      error: error.response?.data || "Registration failed",
    });
  }
}

// Handler for user login
async function handleLogin(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    const response = await axios.post(
      `${COINOS_API_URL}/login`,
      {
        user: {
          username,
          password,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(error.response?.status || 500).json({
      error: error.response?.data || "Login failed",
    });
  }
}

async function handleCreateInvoice(req, res) {
  const { token, amount, type = "bitcoin", secret } = req.body;

  if (!token) {
    return res.status(401).json({ error: "Authentication token is required" });
  }

  if (!amount || isNaN(Number(amount))) {
    return res.status(400).json({ error: "Valid amount is required" });
  }

  try {
    const response = await axios.post(
      `${COINOS_API_URL}/invoice`,
      {
        invoice: {
          amount: Number(amount),
          type: type,
          webhook: "https://basechain.d1vj9o3o44bka6.amplifyapp.com/api/webhook",
          secret: secret
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error creating invoice:", error);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to create invoice",
    });
  }
}

async function handleSendBitcoin(req, res) {
  const { token, amount, address } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'Authentication token is required' });
  }

  if (!amount || isNaN(Number(amount))) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  if (!address) {
    return res.status(400).json({ error: 'Bitcoin address is required' });
  }

  try {
    const response = await axios.post(`${COINOS_API_URL}/bitcoin/send`,
      {
        amount: Number(amount),
        address
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error sending Bitcoin:', error);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to send Bitcoin'
    });
  }
}