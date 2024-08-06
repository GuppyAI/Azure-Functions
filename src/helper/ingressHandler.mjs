import { saveMessage } from "./cosmosDbHelper.mjs";
import { generateResponse } from "./openAiHelper.mjs";
import { sendSMS } from "./smsEgressHandler.mjs";

export let appContext = null;

export async function ingressHandler(message, context) {
    appContext = context;
    const userID = context.triggerMetadata.userProperties.address;
    const userData = await saveMessage(userID, message, "user");
    const response = await generateResponse(userData.messages);
    const responseMessage = response.choices[0].message.content;
    await saveMessage(userID, responseMessage, "assistant");
    sendSMS(responseMessage, userID);
}