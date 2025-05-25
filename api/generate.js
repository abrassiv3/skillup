export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Missing title in request body" });
  }

  // Simulated description generation
  const generatedDescription = `This project titled "${title}" is focused on delivering quality outcomes with the best practices.`;

  return res.status(200).json({ description: generatedDescription });
}
