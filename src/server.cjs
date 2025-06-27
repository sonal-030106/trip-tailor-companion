const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { Together } = require('together-ai');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  try {
    const response = await together.chat.completions.create({
      messages,
      model: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free',
    });
    res.json(response);
  } catch (error) {
    console.error('Error from Together.ai API:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 