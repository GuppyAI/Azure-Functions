import { Container, CosmosClient, Database } from "@azure/cosmos";
import { createHash } from "crypto";
import {
  ChatCompletionMessageParam,
  ChatCompletionRole,
} from "openai/resources/chat/completions";

export class CosmosDbHelper {
  private readonly client: CosmosClient;
  private database: Database;
  private container: Container;

  constructor(
    private readonly connectionString: string,
    private readonly databaseName: string,
    private readonly containerName: string,
  ) {
    this.client = new CosmosClient(connectionString);
    this.database = this.client.database(databaseName);
    this.container = this.database.container(containerName);
  }

  private async userExists(userID: string): Promise<boolean> {
    const hashedUserID = HashUserID.hashUserID(userID);
    const querySpec = {
      query: "SELECT VALUE COUNT(1) FROM c WHERE c.id = @hashedUserID",
      parameters: [{ name: "@hashedUserID", value: hashedUserID }],
    };
    const { resources: results } = await this.container.items
      .query(querySpec)
      .fetchAll();
    return results[0] > 0;
  }

  public async saveMessage(
    userID: string,
    content: string,
    role: ChatCompletionRole,
  ): Promise<Array<ChatCompletionMessageParam>> {
    const hashedUserID = HashUserID.hashUserID(userID);
    if (!(await this.userExists(userID))) {
      const response = await this.container.items.create({
        id: hashedUserID,
        messages: [{ role, content }],
      });
      return response.resource
        .messages as unknown as Array<ChatCompletionMessageParam>;
    } else {
      const response = await this.container
        .item(hashedUserID, hashedUserID)
        .patch({
          operations: [
            {
              op: "add",
              path: "/messages/-",
              value: { role, content },
            },
          ],
        });
      return response.resource
        .messages as unknown as Array<ChatCompletionMessageParam>;
    }
  }

  public async deleteMessages(userID: string): Promise<void> {
    const hashedUserID = HashUserID.hashUserID(userID);
    if (await this.userExists(userID)) {
      await this.container
        .item(hashedUserID, hashedUserID)
        .replace({ id: hashedUserID, messages: [] });
    }
  }
}

class HashUserID {
  private static hashedUserID: string;

  public static hashUserID(userID: string): string {
    if (!HashUserID.hashedUserID) {
      HashUserID.hashedUserID = createHash("sha256")
        .update(userID)
        .digest("hex");
    }
    return HashUserID.hashedUserID;
  }
}
