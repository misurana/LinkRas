
export async function getAIResponse(userQuery, menu, restaurantName) {
  const API_KEY = "AIzaSyCNCA3xnYybndrqKj6aQCYBTBiFByK4wJ8";
  
  const menuContext = menu.map(item => `- ${item.name} (${item.category}): ₹${item.price} - ${item.description}`).join('\n');
  
  const prompt = `You are a professional digital waiter for ${restaurantName}. 
Use this menu to answer questions. Be specific. Mention prices. Use dish names exactly.
MENU:
${menuContext}

CUSTOMER: "${userQuery}"
WAITER:`;

  // Your account specifically supports Gemini 2.0 and 2.5
  const models = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.0-flash-lite"];
  
  for (const modelId of models) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      
      if (data.error) continue;

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text;
      }
    } catch (err) {
      console.error(`Error with ${modelId}:`, err);
    }
  }

  return "I'm having a bit of trouble connecting to my brain. Please check the menu for now!";
}
