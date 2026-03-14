require("dotenv").config();
const { InferenceClient } = require("@huggingface/inference");

// ── Very defensive token loading + logging ──
const rawToken = process.env.HF_TOKEN;
const hfToken = typeof rawToken === "string" ? rawToken.trim() : "";

console.log("[HF] Raw HF_TOKEN from env   :", JSON.stringify(rawToken));
console.log("[HF] Processed hfToken       :", JSON.stringify(hfToken));

let hfClient = null;
let initError = null;

if (hfToken) {
    if (!hfToken.startsWith("hf_")) {
        initError = "HF_TOKEN does not start with 'hf_' → invalid format";
    } else if (hfToken.length < 35) {  // usually 37+ chars
        initError = `HF_TOKEN too short (${hfToken.length} chars) → probably invalid`;
    } else {
        try {
            hfClient = new InferenceClient(hfToken, {   // ← positional first arg = token!
                provider: "together",                   // passed in options object
                // If needed later: endpointUrl: "https://..."
            });
            console.log("[HF] Initialized with provider: together");
            console.log("[HF] InferenceClient initialized OK");
        } catch (err) {
            initError = "Failed to create InferenceClient: " + (err.message || err);
            console.error("[HF]", initError, err);
        }
    }
} else {
    initError = "HF_TOKEN is missing or empty in .env";
}

if (initError) {
    console.error("[HF] Initialization failed →", initError);
}

// ── Call Hugging Face AI ──
async function callHuggingFaceAI(text) {
    if (!hfClient) {
        return `🤖 Cream AI is offline: ${initError || "No valid HF_TOKEN found"}`;
    }

    try {
        const response = await hfClient.chatCompletion({
            model: "Qwen/Qwen2.5-7B-Instruct",  // solid, widely supported on Together + others
            messages: [{ role: "user", content: text }],
            max_tokens: 180,
            temperature: 0.75,
        });

        // Modern chatCompletion returns OpenAI-like shape
        if (response?.choices?.[0]?.message?.content) {
            return response.choices[0].message.content.trim();
        }

        return "… Cream is thinking really hard but got confused";
    } catch (err) {
        console.error("[HF] API error:", err.message || err);
        const msg = err.message || "";

        if (msg.includes("rate limit") || msg.includes("429")) {
            return "Cream is taking a quick nap (rate limit hit) — try again soon!";
        }
        if (msg.includes("not supported") || msg.includes("paused") || msg.includes("no provider")) {
            return "Hmm… that model/provider combo isn't available right now. Cream will try something else next time!";
        }
        if (msg.includes("model") && msg.includes("not found")) {
            return "Cream can't find that model right now… maybe ask about bunnies instead?";
        }

        return "Hmm… Cream's brain short-circuited. Try again?";
    }
}

// ── Main handler ──
async function handleCreamMessage(message) {
    const text = message.content.trim();
    if (!text) return "…what did you want to say?";

    const lower = text.toLowerCase();

    // Optional quick replies (expand as you like)
    if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
        return "Hi hi~! Cream is here and super excited to chat! What’s on your mind?";
    }

    return await callHuggingFaceAI(text);
}

module.exports = { handleCreamMessage, callHuggingFaceAI };