// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method Not Allowed" });
//   }

//   const { title } = req.body;

//   if (!title) {
//     return res.status(400).json({ error: "Missing title in request body" });
//   }

//   // Simulated description generation
//   const generatedDescription = `This project titled "${title}" is focused on delivering quality outcomes with the best practices.`;

//   return res.status(200).json({ description: generatedDescription });
// }

import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Missing title in request body" });
  }

  try {
    const prompt = `Write a compelling project description for a freelance job titled: "${title}".`;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const generatedDescription = response.data.choices[0].message.content;

    return res.status(200).json({ description: generatedDescription });
  } catch (error) {
    console.error("OpenAI error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to generate description" });
  }
}
