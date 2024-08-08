import { CosmosClient } from "@azure/cosmos";
import { appContext } from "./ingressHandler.mjs";
import { createHash } from "crypto";

const client = new CosmosClient(process.env["COSMOSDB_CONNECTION"]);
const database = client.database(process.env["COSMOSDB_DATABASE"]);
const container = database.container(process.env["COSMOSDB_CONTAINER"]);
const hashUtil = createHash("sha256");

function hashUserID(userID) {
    return hashUtil.update(userID).digest("hex");
}

async function userExists(userID) {
    hashedUserID = hashUserID(userID);
    return (await container.items.query({
        query: "SELECT VALUE COUNT(1) FROM c WHERE c.id = @hashedUserID",
        parameters: [
            { name: "@hashedUserID", value: hashedUserID }
        ]
    }).fetchAll()).resources[0] > 0;
}

export async function saveMessage(userID, message, role) {
    hashedUserID = hashUserID(userID);
    let response = null;
    if (! (await userExists(hashedUserID))) {
        response = container.items.create({
            id: hashedUserID,
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
        response = container.item(hashedUserID, hashedUserID).patch({
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