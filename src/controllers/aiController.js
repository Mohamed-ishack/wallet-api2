import { processAiMessage } from "../services/aiService.js";
import { sql } from "../config/db.js";

export async function handleAiChat(req, res) {
    try {
        const { message, user_id } = req.body;

        if (!message || !user_id) {
            return res.status(400).json({ message: "Message and user_id are required" });
        }

        const aiResult = await processAiMessage(message);

        // If AI identified a transaction, we can optionally save it right away
        // or return it to the frontend for confirmation.
        // For now, let's just return the result and let the frontend decide.

        // However, if we want to be "proactive", we could save it here.
        // Let's stick to returning it first for a better UX (verification).

        res.status(200).json(aiResult);
    } catch (error) {
        console.error("Error in AI chat controller:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
}
