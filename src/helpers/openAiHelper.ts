import { AzureOpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

export class OpenAiHelper {

    private client: AzureOpenAI;
    private maxTokens: number;

    constructor(private readonly endpoint: string, private readonly apiKey: string, private readonly apiVersion: string, private readonly deployment: string, private readonly system_prompt: string,  maxTokens: number) {
        this.client = new AzureOpenAI({endpoint, apiKey, apiVersion, deployment});
        this.maxTokens = maxTokens;
    }

    async generateResponse(messages: Array<ChatCompletionMessageParam>): Promise<string> {
        const response = await this.client.chat.completions.create({
            messages: [
                {role: "system", content: this.system_prompt},
                ...messages
            ],
            model: "",
            max_tokens: this.maxTokens
        });

        return response.choices[0].message.content;
    }

}