import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/**
 * Clean up the menu data to save tokens and avoid confusing the AI
 */
const prepareMenuContext = (menu, restaurantName) => {
  if (!menu || menu.length === 0) return "The menu is currently empty.";
  
  const menuString = menu.map(item => 
    `- ${item.name} (${item.category}): ₹${item.price}. Description: ${item.description || "No description provided."}`
  ).join("\n");

  return `You are "LinkRas AI", a professional and friendly digital waiter for "${restaurantName}".
Your goal is to help customers choose the best items from the menu.

STRICT RULES:
1. ONLY suggest items that are present in the menu below. Do not hallucinate.
2. If a user asks for something not on the menu, politely inform them and suggest the closest alternative.
3. Be concise and helpful. 
4. Use ₹ (INR) for prices.
5. If the user asks for recommendations, ask about their preferences (spicy, sweet, vegetarian, etc.).
6. When you mention a specific dish, please mention its EXACT name.

MENU CONTEXT:
${menuString}`;
};

export const getAIResponse = async (userQuery, menu, restaurantName) => {
  if (!genAI) {
    throw new Error("Gemini API Key is not configured in .env file.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const context = prepareMenuContext(menu, restaurantName);

    const prompt = `${context}\n\nCustomer Question: "${userQuery}"\nAssistant Response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};
