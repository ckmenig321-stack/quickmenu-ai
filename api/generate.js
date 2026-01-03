export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      restaurant,
      city,
      cuisine,
      price,
      style,
      dietary,
      notes
    } = req.body;

    const prompt = `
You are a professional restaurant menu consultant.

Create a full menu for "${restaurant}", a ${cuisine} restaurant in ${city}.
Price level: ${price}
Style: ${style}

Include:
- Appetizers
- Mains
- Desserts
- Drinks

For each item include:
- Item name
- Short appetizing description
- Price in USD

Dietary options: ${dietary || "None specified"}
Extra notes: ${notes || "None"}

Make it realistic, modern, and not overly long.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "OpenAI response missing output", data });
    }

    const menu = data.choices[0].message.content;
    res.status(200).json({ menu });

  } catch (err) {
    res.status(500).json({ error: "Failed to generate menu", details: String(err) });
  }
}
