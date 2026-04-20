
export async function getAIResponse(userQuery, menu, restaurantName) {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!menu || menu.length === 0) {
    return "I see the menu is currently being updated! Is there something specific I can help you find?";
  }

  const menuContext = menu.map(item => `- ${item.name} (${item.category}): ₹${item.price} - ${item.description}`).join('\n');
  
  const prompt = `You are a professional digital waiter for ${restaurantName}. 
Use this menu to answer questions. Be specific and polite.
MENU:
${menuContext}

CUSTOMER: "${userQuery}"
WAITER:`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
       if (data.error.code === 429) {
         return "I'm a bit overwhelmed with orders! Please give me a few seconds to catch my breath and ask again.";
       }
       throw new Error(data.error.message);
    }

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text;
    }
    
    return "I'm having a bit of trouble connecting to my brain. Please check the menu for now!";
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
}
