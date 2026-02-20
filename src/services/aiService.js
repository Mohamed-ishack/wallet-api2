import dotenv from "dotenv";

dotenv.config();

/**
 * Extracts transaction details from natural language using Gemini AI.
 * @param {string} message - The user's input message.
 * @returns {Promise<Object>} - The parsed transaction data or a response string.
 */
export async function processAiMessage(message) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured in the backend .env file.");
    }

    const prompt = `
    You are a financial assistant for an expense tracker app.
    Your goal is to extract transaction details from the user's message.
    
    Categories available: "Food & Drinks", "Shopping", "Transportation", "Entertainment", "Bills", "Income", "Other".
    
    Rules:
    1. If the message describes a transaction, return a JSON object with:
       - type: "transaction"
       - title: (string)
       - amount: (number, negative for expense, positive for income)
       - category: (one of the available categories)
    2. If the message is a general query or greeting, return:
       - type: "response"
       - content: (string)
    3. Be concise and helpful.
    
    User Message: "${message}"
    
    Return ONLY JSON.
  `;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }],
                        },
                    ],
                }),
            }
        );

        const data = await response.json();

        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return { type: "response", content: "I'm having trouble connecting to my brain right now." };
        }

        const aiText = data.candidates[0].content.parts[0].text;

        // Extract JSON from the response (sometimes AI wraps it in markdown blocks)
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return { type: "response", content: aiText.trim() };
    } catch (error) {
        console.error("Error processing AI message:", error);
        return { type: "response", content: "Sorry, I couldn't process that. Could you try again?" };
    }
}
