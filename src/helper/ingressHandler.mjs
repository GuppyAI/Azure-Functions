import { sendSMS } from "./smsEgressHandler.mjs";

export function ingressHandler(message, context) {
    context.log('Service bus queue function processed message:', message);
    context.log('Service bus queue function processed context:', context);
    sendSMS(message, context.triggerMetadata.userProperties.address)
}