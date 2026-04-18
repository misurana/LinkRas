
export async function getAIResponse(userQuery, menu, restaurantName) {
  const API_KEY = "AIzaSyCNCA3xnYybndrqKj6aQCYBTBiFByK4wJ8";
  
  const menuContext = menu.map(item => `- ${item.name} (${item.category}): ₹${item.price} - ${item.description}`).join('\n');
  
  const prompt = `You are a professional digital waiter for ${restaurantName}. 
Use this menu to answer questions. Be specific. Mention prices. Use dish names exactly.
MENU:
${menuContext}

CUSTOMER: "${userQuery}"
WAITER:`;

  // Try 1.5 Flash first (Smartest), then fallback to Pro if Google rejects the model ID
  const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro"];
  
  for (const modelId of models) {
    try {
      console.log(`Trying model: ${modelId}...`);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.warn(`Model ${modelId} failed:`, data.error.message);
        continue; // Try next model
      }

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        console.log(`Success with ${modelId}`);
        return data.candidates[0].content.parts[0].text;
      }
    } catch (err) {
      console.error(`Error with ${modelId}:`, err);
    }
  }

  return "I'm having a bit of trouble connecting to my brain. Please check the menu for now!";
}
