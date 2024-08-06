import { AzureOpenAI } from "openai";

const client = new AzureOpenAI({
    endpoint: process.env["OPENAI_ENDPOINT"],
    apiKey: process.env["OPENAI_KEY"],
    apiVersion: process.env["OPENAI_VERSION"],
    deployment: process.env["OPENAI_DEPLOYMENT"]
});

export async function generateResponse(messages) {
    return await client.chat.completions.create({
        messages: messages,
        model: "",
        max_tokens: process.env["OPENAI_MAX_TOKENS"],
    })
}