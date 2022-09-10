import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

const dbClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY;

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: "",
  };

  try {
    if (event.queryStringParameters) {
      if (PRIMARY_KEY! in event.queryStringParameters) {
        const keyValue = event.queryStringParameters[PRIMARY_KEY!];
        const queryResponse = await dbClient
          .query({
            TableName: TABLE_NAME!,
            KeyConditionExpression: "#zz = :zzzz",
            ExpressionAttributeNames: {
              "#zz": PRIMARY_KEY!,
            },
            ExpressionAttributeValues: {
              ":zzzz": keyValue,
            },
          })
          .promise();
        result.body = JSON.stringify(queryResponse);
      }
    } else {
      const queryResponse = await dbClient
        .scan({
          TableName: TABLE_NAME!,
        })
        .promise();

      result.body = JSON.stringify(queryResponse);
    }
  } catch (error: any) {
    result.statusCode = 500;
    result.body = error.message;
  }

  return result;
}

export { handler };
