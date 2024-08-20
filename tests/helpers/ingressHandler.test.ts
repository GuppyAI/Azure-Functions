import { ingressHandler } from '../../src/helpers/ingressHandler';
import { InvocationContext } from "@azure/functions";
import { CosmosDbHelper } from "../../src/helpers/cosmosDbHelper";
import { OpenAiHelper } from "../../src/helpers/openAiHelper";
import { SmsEgressHandler } from "../../src/helpers/smsEgressHandler";
import { ChatCompletionMessageParam } from "openai/resources";

jest.mock('../../src/helpers/cosmosDbHelper');
jest.mock('../../src/helpers/openAiHelper');
jest.mock('../../src/helpers/smsEgressHandler');

describe('ingressHandler', () => {
  let context: InvocationContext;
  let cosmosDbHelperMock: jest.Mocked<CosmosDbHelper>;
  let openAiHelperMock: jest.Mocked<OpenAiHelper>;
  let smsEgressHandlerMock: jest.Mocked<SmsEgressHandler>;

  beforeEach(() => {
    context = {
      triggerMetadata: {
        userProperties: {
          address: 'testUserID'
        }
      }
    } as unknown as InvocationContext;

    cosmosDbHelperMock = new CosmosDbHelper('', '', '') as jest.Mocked<CosmosDbHelper>;
    openAiHelperMock = new OpenAiHelper('', '', '', '', '', 0) as jest.Mocked<OpenAiHelper>;
    smsEgressHandlerMock = new SmsEgressHandler('', '') as jest.Mocked<SmsEgressHandler>;

    (CosmosDbHelper as jest.Mock).mockImplementation(() => cosmosDbHelperMock);
    (OpenAiHelper as jest.Mock).mockImplementation(() => openAiHelperMock);
    (SmsEgressHandler as unknown as jest.Mock).mockImplementation(() => smsEgressHandlerMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle STOP message correctly', async () => {
    const message = 'STOP';
    process.env['RESET_MESSAGE'] = 'Reset message';

    await ingressHandler(message, context);

    expect(cosmosDbHelperMock.deleteMessages).toHaveBeenCalledWith('testUserID');
    expect(smsEgressHandlerMock.sendSMS).toHaveBeenCalledWith('testUserID', 'Reset message');
  });

  it('should handle non-STOP message correctly', async () => {
    const message = 'Hello';
    const savedMessages = ['Hello'];
    const aiResponse = 'Hi there!';

    cosmosDbHelperMock.saveMessage.mockResolvedValue(savedMessages as unknown as ChatCompletionMessageParam[]);
    openAiHelperMock.generateResponse.mockResolvedValue(aiResponse);

    await ingressHandler(message, context);

    expect(cosmosDbHelperMock.saveMessage).toHaveBeenCalledWith('testUserID', message, 'user');
    expect(openAiHelperMock.generateResponse).toHaveBeenCalledWith(savedMessages);
    expect(cosmosDbHelperMock.saveMessage).toHaveBeenCalledWith('testUserID', aiResponse, 'assistant');
    expect(smsEgressHandlerMock.sendSMS).toHaveBeenCalledWith('testUserID', aiResponse);
  });
});