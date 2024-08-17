import { InvocationContext } from "@azure/functions";
import { CosmosDbHelper } from "./cosmosDbHelper";
import { OpenAiHelper } from "./openAiHelper";
import { SmsEgressHandler } from "./smsEgressHandler";

export async function ingressHandler(
  message: string,
  context: InvocationContext,
): Promise<void> {
  const userID = (context.triggerMetadata.userProperties as UserProperties)
    .address;

  const cosmosDbHelper = new CosmosDbHelper(
    process.env["COSMOSDB_CONNECTION"],
    process.env["COSMOSDB_DATABASE"],
    process.env["COSMOSDB_CONTAINER"],
  );
  const smsEgressHandler = new SmsEgressHandler(
    process.env["SERVICEBUS_CONNECTION_EGRESS"],
    process.env["EGRESS_QUEUE"],
  );

  if (message === "STOP") {
    cosmosDbHelper.deleteMessages(userID);
    smsEgressHandler.sendSMS(userID, process.env["RESET_MESSAGE"]);
    return;
  }

  const messages = await cosmosDbHelper.saveMessage(userID, message, "user");

  const openAiHelper = new OpenAiHelper(
    process.env["OPENAI_ENDPOINT"],
    process.env["OPENAI_KEY"],
    process.env["OPENAI_VERSION"],
    process.env["OPENAI_DEPLOYMENT"],
    process.env["OPENAI_SYSTEM_PROMPT"],
    parseInt(process.env["OPENAI_MAX_TOKENS"]),
  );
  const response = await openAiHelper.generateResponse(messages);

  cosmosDbHelper.saveMessage(userID, response, "assistant");
  smsEgressHandler.sendSMS(userID, response);
  smsEgressHandler.close();
}

type UserProperties = {
  address: string;
};
