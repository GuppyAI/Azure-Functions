import { CosmosClient } from "@azure/cosmos";
import { appContext } from "./ingressHandler.mjs";

const client = new CosmosClient(process.env["COSMOSDB_CONNECTION"]);
const database = client.database(process.env["COSMOSDB_DATABASE"]);
const container = database.container(process.env["COSMOSDB_CONTAINER"]);

async function userExists(userID) {
    return (await container.items.query({
        query: "SELECT VALUE COUNT(1) FROM c WHERE c.id = @userID",
        parameters: [
            { name: "@userID", value: userID }
        ]
    }).fetchAll()).resources[0] > 0;
}

export async function saveMessage(userID, message, role) {
    let response = null;
    if (! (await userExists(userID))) {
        response = container.items.create({
            id: userID,
            messages: [
                {
                    role: "system",
                    content: process.env["OPENAI_SYSTEM_PROMPT"]
                },
                {
                    role: role,
                    content: message
                }
            ]
        });
    }
    else {
        response = container.item(userID, userID).patch({
            operations: [
                {
                    op: "add",
                    path: "/messages/-",
                    value: {
                        role: role,
                        content: message
                    }
                }
            ]
        })
    }
    return (await response).resource;
}