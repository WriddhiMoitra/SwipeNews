const fetch = require('node-fetch');

const GEMINI_API_KEY = 'AIzaSyA9AfkYygKFCSwqjNxOm-EC9V4mog7IwLo';

async function getGeminiAnswer(query, context) {
  const prompt = `Context:\n${context}\n\nQuestion: ${query}\nAnswer:`;
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

module.exports = { getGeminiAnswer };
