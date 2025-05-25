// export default async function handler(req, res) {
//   const { prompt } = req.body;

//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: prompt }],
//       temperature: 0.7,
//     }),
//   });

//   const data = await response.json();
//   res.status(200).json({ result: data.choices[0].message.content });
// }


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,  // 👈 your secret key in Vercel env vars
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an assistant that helps write professional project descriptions.",
          },
          {
            role: "user",
            content: `Write a project description based on this title: "${title}"`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const result = await completion.json();

    const aiResponse = result.choices?.[0]?.message?.content;
    res.status(200).json({ description: aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate description" });
  }
}
