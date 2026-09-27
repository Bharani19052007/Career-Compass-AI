export async function callGroqAI(systemPrompt: string, userPrompt: string, jsonMode: boolean = false) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Groq API key not found. Please add it to your .env.local file.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "qwen/qwen3.8-27b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5,
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Groq API Error:", error);
    throw new Error(`Groq API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content;
  
  if (jsonMode) {
    // Extract JSON if the model wrapped it in markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      content = jsonMatch[1];
    }
  }

  return content;
}
