import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, sessionId, stage = 'hml' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // AI Routing usando Claude
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Você é um assistente da Raiz Educação. Responda de forma amigável à mensagem: "${message}"`
      }]
    });

    const text = response.content[0].text;

    res.status(200).json({
      type: 'greeting',
      text: text || 'Olá! Como posso ajudar?'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      type: 'clarify',
      text: 'Desculpe, ocorreu um erro. Tente novamente.'
    });
  }
}
