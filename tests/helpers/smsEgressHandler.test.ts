import { SmsEgressHandler } from '../../src/helpers/smsEgressHandler';
import { ServiceBusClient, ServiceBusSender } from "@azure/service-bus";

jest.mock("@azure/service-bus");

describe('SmsEgressHandler', () => {
  let connectionString: string;
  let queueName: string;
  let smsEgressHandler: SmsEgressHandler;
  let mockClient: jest.Mocked<ServiceBusClient>;
  let mockSender: jest.Mocked<ServiceBusSender>;

  beforeEach(() => {
    connectionString = 'fake-connection-string';
    queueName = 'fake-queue-name';
    mockClient = new ServiceBusClient(connectionString) as jest.Mocked<ServiceBusClient>;
    mockSender = {
        sendMessages: jest.fn(),
    } as unknown as jest.Mocked<ServiceBusSender>;

    (ServiceBusClient as jest.Mock).mockReturnValue(mockClient);
    mockClient.createSender.mockReturnValue(mockSender);

    smsEgressHandler = new SmsEgressHandler(connectionString, queueName);
  });

  it('should initialize ServiceBusClient and ServiceBusSender correctly', () => {
    expect(ServiceBusClient).toHaveBeenCalledWith(connectionString);
    expect(mockClient.createSender).toHaveBeenCalledWith(queueName);
  });

  it('should call sendMessages with correct parameters', () => {
    const userID = 'user123';
    const message = 'Hello, World!';
    const encodedMessage = new TextEncoder().encode(message);

    smsEgressHandler.sendSMS(userID, message);

    expect(mockSender.sendMessages).toHaveBeenCalledWith({
      applicationProperties: {
        address: userID,
      },
      body: encodedMessage,
      contentType: "text/plain",
    });
  });
});