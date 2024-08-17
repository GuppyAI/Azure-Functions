import { ServiceBusClient, ServiceBusSender } from "@azure/service-bus";

export class SmsEgressHandler {
  private client: ServiceBusClient;
  private sender: ServiceBusSender;
  private static utf8Encode = new TextEncoder();

  constructor(
    private readonly connectionString: string,
    private readonly queueName: string,
  ) {
    this.client = new ServiceBusClient(connectionString);
    this.sender = this.client.createSender(queueName);
  }

  sendSMS(userID: string, message: string): void {
    this.sender.sendMessages({
      applicationProperties: {
        address: userID,
      },
      body: SmsEgressHandler.utf8Encode.encode(message),
      contentType: "text/plain",
    });
  }

  close(): void {
    this.sender.close();
    this.client.close();
  }
}
