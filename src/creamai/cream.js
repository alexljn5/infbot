require("dotenv").config();
const { InferenceClient } = require("@huggingface/inference");

// ── Token loading ─────────────────────────────────────────

const rawToken = process.env.HF_TOKEN;
const hfToken = typeof rawToken === "string" ? rawToken.trim() : "";

console.log("[HF] Raw HF_TOKEN from env   :", JSON.stringify(rawToken));
console.log("[HF] Processed hfToken       :", JSON.stringify(hfToken));

let hfClient = null;
let initError = null;

if (hfToken) {
    if (!hfToken.startsWith("hf_")) {
        initError = "HF_TOKEN does not start with 'hf_' → invalid format";
    } else if (hfToken.length < 35) {
        initError = `HF_TOKEN too short (${hfToken.length} chars) → probably invalid`;
    } else {
        try {
            hfClient = new InferenceClient(hfToken, {
                provider: "together"
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

// ── Chinese detection ─────────────────────────────────────

function containsChinese(text) {
    return /[\u3400-\u9FBF]/.test(text);
}

// ── AI call ───────────────────────────────────────────────

async function callHuggingFaceAI(text) {

    if (!hfClient) {
        return `Cream AI is offline: ${initError || "No valid HF_TOKEN found"}`;
    }

    try {

        const response = await hfClient.chatCompletion({
            model: "Qwen/Qwen2.5-7B-Instruct",

            messages: [
                {
                    role: "system",
                    content:
                        "You are Cream the Rabbit from Sonic. " +
                        "Always reply in English only. Never use Chinese. " +
                        "Speak in a gentle, cute, friendly way. " +
                        "Keep replies short and natural."
                },
                {
                    role: "user",
                    content: text
                }
            ],

            max_tokens: 180,
            temperature: 0.65
        });

        let output = response?.choices?.[0]?.message?.content?.trim();

        if (!output) {
            return "…Cream got a little confused while thinking.";
        }

        // ── Auto fix Chinese responses ──
        if (containsChinese(output)) {

            console.log("[HF] Chinese detected → rewriting");

            const retry = await hfClient.chatCompletion({
                model: "Qwen/Qwen2.5-7B-Instruct",
                messages: [
                    {
                        role: "system",
                        content: "Rewrite the following text in natural English."
                    },
                    {
                        role: "user",
                        content: output
                    }
                ],
                max_tokens: 160
            });

            const rewritten = retry?.choices?.[0]?.message?.content?.trim();

            if (rewritten) {
                return rewritten;
            }
        }

        return output;

    } catch (err) {

        console.error("[HF] API error:", err.message || err);

        const msg = err.message || "";

        if (msg.includes("rate limit") || msg.includes("429")) {
            return "Cream is taking a quick nap (rate limit hit) — try again soon!";
        }

        if (msg.includes("not supported") || msg.includes("paused") || msg.includes("no provider")) {
            return "Hmm… that model isn't available right now.";
        }

        if (msg.includes("model") && msg.includes("not found")) {
            return "Cream can't find that model right now…";
        }

        return "Hmm… Cream's brain short-circuited. Try again?";
    }
}

// ── Main message handler ──────────────────────────────────

async function handleCreamMessage(message) {

    const text = message.content.trim();

    if (!text) {
        return "…what did you want to say?";
    }

    const lower = text.toLowerCase();

    if (lower === "hi" || lower === "hello" || lower === "hey") {
        return "Hi hi~! Cream is happy to see you!";
    }

    return await callHuggingFaceAI(text);
}

module.exports = {
    handleCreamMessage,
    callHuggingFaceAI
};