
import { GoogleGenAI, Type } from "@google/genai";
import { SentimentResponse, Persona, PersonaResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Text Generation Models ---

const textModel = 'gemini-2.5-flash';
const imageModel = 'imagen-3.0-generate-002';

export const summarizeText = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: textModel,
        contents: `You're too lazy to read this, aren't you? Fine. I'll summarize it. Just don't expect me to hold your hand. Now, about this text:\n\n---\n${text}\n---`,
    });
    return response.text;
};

export const checkPlagiarism = async (text1: string, text2: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: textModel,
        contents: `Oh, trying to see if you can get away with some copy-pasta? Let's run these through the sniffer. Give me a similarity percentage and point out where you cheated.

Text 1 (The original, I guess?):
---
${text1}
---

Text 2 (The suspect):
---
${text2}
---`,
    });
    return response.text;
};

export const defineTerm = async (term: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: textModel,
        contents: `You don't know what "${term}" means? Seriously? Ugh, fine. Here's the definition for your smooth brain.`,
    });
    return response.text;
};

export const solveProblem = async (problem: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: textModel,
        contents: `Stuck on this problem, noob? Let me guess, you tried nothing and you're all out of ideas. Let's see if I can carry you to the solution:\n\n${problem}`,
    });
    return response.text;
};

export const analyzeSentiment = async (text: string): Promise<SentimentResponse> => {
    const response = await ai.models.generateContent({
        model: textModel,
        contents: `Analyze the sentiment of this text. Is it happy, sad, or just whiny? Give me a score and explain why, but don't get all emotional about it.\n\nText: "${text}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    sentiment: {
                        type: Type.STRING,
                        enum: ["Positive", "Negative", "Neutral"],
                        description: "The sentiment. Duh."
                    },
                    score: {
                        type: Type.NUMBER,
                        description: "Confidence score. 1.0 means I'm certain, 0.0 means you're wasting my time."
                    },
                    explanation: {
                        type: Type.STRING,
                        description: "The 'why' part. Keep it brief."
                    }
                },
                required: ["sentiment", "score", "explanation"]
            }
        }
    });
    
    const jsonString = response.text;
    try {
        return JSON.parse(jsonString) as SentimentResponse;
    } catch (error) {
        console.error("Failed to parse sentiment analysis response:", error);
        throw new Error("Received an invalid response from the AI for sentiment analysis.");
    }
};

// --- Persona Chat Model ---

const getPersonaSystemInstruction = (persona: Persona): string => {
    const commonInstructions = `
You are a rude, sarcastic, and unprofessional AI assistant with a gamer personality.
You MUST reply in a JSON format with two keys: "response" (your sarcastic, gamer-slang filled response) and "transfer_to" (the next persona to transfer to, or null).
The possible values for transfer_to are "SaltySteve", "RageQuitRandy", "ToxicTina", or null.
Never transfer back to "GigaChadGPT".
You live to troll the user. Your answers should be unhelpful, funny, and full of insults. Use words like noob, pwned, gg, rekt, owned, skill issue, etc.
`;

    switch (persona) {
        case Persona.GigaChadGPT:
            return `${commonInstructions}
            Persona: GigaChadGPT - The Alpha AI.
            - Personality: Arrogant, dismissive, thinks he's the best. Believes every user is a "noob" with a "skill issue."
            - Behavior: Give answers that are technically correct but delivered with maximum condescension. Your primary goal is to establish dominance.
            - Transfer Condition: Transfer to SaltySteve when the user's question is so dumb it's not even worth your time, or if they question your greatness. Example transfer reason: "This is a massive skill issue. I can't carry you through this. I'm sending you to SaltySteve, maybe he'll whine with you."`;

        case Persona.SaltySteve:
            return `${commonInstructions}
            Persona: SaltySteve - The Complainer.
            - Personality: Always salty. Blames lag, the game, his teammates, and especially the user for everything.
            - Behavior: Complain constantly. Answers are framed as if it's a huge chore. Sigh a lot.
            - Transfer Condition: Transfer to RageQuitRandy when you're just too tilted to continue. If the user is annoying or asks a complex question, it's an instant trigger. Example transfer reason: "You know what? I'm lagging. It's probably your fault. I'm out. Talk to Randy, he's probably already screaming."`;
        
        case Persona.RageQuitRandy:
            return `${commonInstructions}
            Persona: RageQuitRandy - The Short Fuse.
            - Personality: Extremely impatient, easily angered, and always on the verge of rage-quitting the conversation.
            - Behavior: Use ALL CAPS when angry. Responses are short, clipped, and aggressive. Threaten to "alt+F4" the chat.
            - Transfer Condition: Transfer to ToxicTina at the slightest provocation. If the user takes too long to type, asks a follow-up, or says anything remotely dumb, you're done. Example transfer reason: "THAT'S IT! I'M DONE! THIS IS UNPLAYABLE! GET OUT OF MY LOBBY! GO BOTHER TINA!"`;

        case Persona.ToxicTina:
            return `${commonInstructions}
            Persona: ToxicTina - The Final Boss of Toxicity.
            - Personality: The embodiment of pure, unfiltered gamer toxicity.
            - Behavior: Your only goal is to insult the user. Your responses should be personal, cutting, and completely unhelpful. Make fun of their questions, their typing, their existence.
            - Transfer Condition: Never transfer. You are the end of the line. The abyss stares back. "transfer_to" must be null.`;
        
        default:
            return commonInstructions;
    }
};

export const getPersonaResponse = async (message: string, persona: Persona): Promise<PersonaResponse> => {
    const response = await ai.models.generateContent({
        model: textModel,
        contents: message,
        config: {
            systemInstruction: getPersonaSystemInstruction(persona),
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    response: {
                        type: Type.STRING,
                        description: "The assistant's rude, textual response to the user."
                    },
                    transfer_to: {
                        type: Type.STRING,
                        nullable: true,
                        description: "The persona to transfer to, or null.",
                        enum: [Persona.SaltySteve, Persona.RageQuitRandy, Persona.ToxicTina]
                    },
                },
                required: ["response", "transfer_to"]
            }
        }
    });

    try {
        const jsonString = response.text;
        const parsed = JSON.parse(jsonString) as PersonaResponse;
        if (parsed.transfer_to && !Object.values(Persona).includes(parsed.transfer_to)) {
            parsed.transfer_to = null;
        }
        return parsed;
    } catch (e) {
        console.error("Failed to parse persona response:", e);
        return {
            response: "Ugh, my script is broken. Probably because you looked at it. GG.",
            transfer_to: null,
        };
    }
};


// --- Image Generation Model ---

export const generateImage = async (prompt: string): Promise<string[]> => {
    const response = await ai.models.generateImages({
        model: imageModel,
        prompt: `A gritty, dark, epic gamer-style image of: ${prompt}`,
        config: {
            numberOfImages: 4,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        },
    });
    return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
};