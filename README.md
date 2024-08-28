# Azure Function

This Azure function connects the SMS gateway with Azure Cognitive Services and Azure Cosmos DB to interface with ChatGPT. The function is triggered by incoming Service Bus messages and sends SMS messages to the user based on the response from ChatGPT. Conversations are stored in Cosmos DB.

## Prerequisites

- Azure subscription
    - Azure Service Bus namespace with ingress and egress queues
    - Azure Cosmos DB account with a NoSQL database and a container
    - Azure Cognitive Services account with a deployed Chatmodel
    - Azure Functions app
- Node.js 20 and npm
- Azure Functions Core Tools
- Azure CLI

## Setup

1. Clone the repository.
    ```bash	
    git clone https://github.com/GuppyAI/Azure-Functions.git
    cd Azure-Functions
    ```
2. Install the dependencies.
    ```bash
    npm install
    ```
 3. Create a `local.settings.json` file in the root directory of the project with the following content:
    ```json
    {
        "IsEncrypted": false,
        "Values": {
            "AzureWebJobsStorage": "<connection_string>",
            "FUNCTIONS_WORKER_RUNTIME": "node",
            "AzureWebJobsFeatureFlags": "EnableWorkerIndexing",
            "INGRESS_QUEUE": "<ingress_queue>",
            "EGRESS_QUEUE": "<egress_queue>",
            "SERVICEBUS_CONNECTION_INGRESS": "<connection_string>",
            "SERVICEBUS_CONNECTION_EGRESS": "<connection_string>",
            "COSMOSDB_CONNECTION": "<connection_string>",
            "COSMOSDB_DATABASE": "<database>",
            "COSMOSDB_CONTAINER": "<container>",
            "OPENAI_ENDPOINT": "<endpoint>",
            "OPENAI_KEY": "<key>",
            "OPENAI_VERSION": "<version>",
            "OPENAI_DEPLOYMENT": "<deployment_id>",
            "OPENAI_SYSTEM_PROMPT": "You are a helpful assistant that helps people with their tasks. You are very friendly and always willing to help. You are a good listener and always try to help people solve their problems. You are a good friend.",
            "OPENAI_MAX_TOKENS": 50,
            "RESET_MESSAGE": "<Chat has been reset>\n\nHi I'm Guppy-AI how can I help you today?"
        }
    }
    ```
    Replace the placeholders with the appropriate values.

## Usage

1. Run the function locally.
    ```bash
    func start
    ```
2. Send a message to the ingress queue to trigger the function.
   The message needs a custom property `address` this acts as the unique identifier for the user.
   The function will respond with a message to the egress queue.

## Deployment

1. Deploy the function to Azure.
    ```bash
    func azure functionapp publish <function_app_name>
    ```
2. Ensure the function app has the necessary environment variables set in the Azure portal.

## Testing

All tests are written using Jest and can be run locally without any azure resources.
To run the tests, use the following command:
```bash
npm run test
```

## CI/CD

The function is set up with GitHub Actions workflows to test and build the function on every push.
On every push to the main branch, a GitHub Release is created with the build function and the function is deployed to Azure.
The workflows can be configured with the following environment variables:
- APP_NAME (Azure Function App name)
and the following secrets:
- AZURE_CREDENTIALS (Azure Service Principal credentials)