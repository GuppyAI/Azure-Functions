import { app } from "@azure/functions";
import { ingressHandler } from "../helpers/ingressHandler";

app.serviceBusQueue('trigger_sb_q_ingress', {
    connection: 'SERVICEBUS_CONNECTION_INGRESS',
    queueName: process.env["INGRESS_QUEUE"],
    handler: ingressHandler
});
