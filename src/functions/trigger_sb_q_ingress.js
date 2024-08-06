import { app, output } from '@azure/functions';
import {ingressHandler} from '../helper/ingressHandler.mjs';

app.serviceBusQueue('trigger_sb_q_ingress', {
    connection: 'SERVICEBUS_CONNECTION_INGRESS',
    queueName: process.env["INGRESS_QUEUE"],
    accessRights: "listen",
    handler: ingressHandler
});
