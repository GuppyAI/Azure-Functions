import { RetryMode, ServiceBusClient } from "@azure/service-bus";

const sbClient = new ServiceBusClient(process.env["SERVICEBUS_CONNECTION_EGRESS"], {
    mode: RetryMode.Exponential
});

const sender = sbClient.createSender(process.env["EGRESS_QUEUE"]);

export function sendSMS(message, recipient) {
    sender.sendMessages({
        applicationProperties: {
            address: recipient
        },
        body: message
    })
}