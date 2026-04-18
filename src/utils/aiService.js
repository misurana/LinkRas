
export async function getAIResponse(userQuery, menu, restaurantName) {
  const API_KEY = "AIzaSyCNCA3xnYybndrqKj6aQCYBTBiFByK4wJ8";
  
  // Clean up the menu for the prompt
  const menuContext = menu.map(item => `- ${item.name} (${item.category}): ₹${item.price} - ${item.description}`).join('\n');
  
  const prompt = `You are a professional digital waiter for ${restaurantName}. 
Use the following menu to answer customer questions accurately.
If a dish is mentioned, use its exact name from the menu.
If an item isn't on the menu, politely say we don't serve it.

MENU:
${menuContext}

CUSTOMER: "${userQuery}"
WAITER:`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("AI API Error:", error);
    throw error;
  }
}
