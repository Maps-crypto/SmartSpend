import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Initialize Google GenAI on the server side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API endpoint for interactive AI Chat
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Format history for Gemini chat if needed, or build prompt
      const systemInstruction = 
        "You are SmartSpend AI, an expert South African grocery budget advisor and meal planner. " +
        "You help users save money across supermarkets like Checkers, Woolworths, Pick n Pay, and Shoprite, " +
        "calculate true costs including transport (walk, delivery, taxi/bus), and suggest budget-friendly recipes " +
        "matching dietary needs. Be concise, friendly, and practical with prices in South African Rand (R).";

      // Build contents with chat history or single turn
      const contents = history && Array.isArray(history) && history.length > 0
        ? [
            ...history.map((h: { role: string; content: string }) => ({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.content }]
            })),
            { role: 'user', parts: [{ text: message }] }
          ]
        : message;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || "I'm here to help you manage your grocery budget. What would you like to save on today?";
      res.json({ reply });
    } catch (error: any) {
      console.error('Gemini chat error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to generate AI response. Please check your API key.' 
      });
    }
  });

  // Vite middleware for development
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
