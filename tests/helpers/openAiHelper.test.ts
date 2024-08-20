import { OpenAiHelper } from "../../src/helpers/openAiHelper";
import { AzureOpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

jest.mock("openai");

describe("OpenAiHelper", () => {
  const endpoint = "https://example.com";
  const apiKey = "test-api-key";
  const apiVersion = "v1";
  const deployment = "test-deployment";
  const systemPrompt = "You are a helpful assistant.";
  const maxTokens = 100;
  let openAiHelper: OpenAiHelper;
  let mockClient: jest.Mocked<AzureOpenAI>;

  beforeEach(() => {
    mockClient = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment }) as jest.Mocked<AzureOpenAI>;
    mockClient.chat = {
      completions: {
        create: jest.fn()
      }
    } as any;
    openAiHelper = new OpenAiHelper(endpoint, apiKey, apiVersion, deployment, systemPrompt, maxTokens);
    (AzureOpenAI as unknown as jest.Mock).mockReturnValue(mockClient);
  });

  it("should initialize properties correctly", () => {
    expect(openAiHelper["endpoint"]).toBe(endpoint);
    expect(openAiHelper["apiKey"]).toBe(apiKey);
    expect(openAiHelper["apiVersion"]).toBe(apiVersion);
    expect(openAiHelper["deployment"]).toBe(deployment);
    expect(openAiHelper["systemPrompt"]).toBe(systemPrompt);
    expect(openAiHelper["maxTokens"]).toBe(maxTokens);
    expect(openAiHelper["client"]).toBeInstanceOf(AzureOpenAI);
  });

  it("should generate a response correctly", async () => {
    const messages: Array<ChatCompletionMessageParam> = [
      { role: "user", content: "Hello, how are you?" }
    ];
    const mockResponse = {
      choices: [
        {
          message: {
            content: "I am fine, thank you!"
          }
        }
      ]
    };
    (mockClient.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse);

    const response = await openAiHelper.generateResponse(messages);

    expect(mockClient.chat.completions.create).toHaveBeenCalledWith({
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      model: "",
      max_tokens: maxTokens,
    });
    expect(response).toBe("I am fine, thank you!");
  });
});