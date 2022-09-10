import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

const dbClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME as string;
const PRIMARY_KEY = process.env.PRIMARY_KEY as string;

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: "",
  };

  const spaceId = event.queryStringParameters?.[PRIMARY_KEY];

  try {
    if (spaceId) {
      await dbClient
        .delete({
          TableName: TABLE_NAME,
          Key: {
            [PRIMARY_KEY]: spaceId,
          },
        })
        .promise();
    }
    result.body = "item was successfully deleted";
  } catch (error: any) {
    result.statusCode = 500;
    result.body = error.message;
  }
  return result;
}

export { handler };
