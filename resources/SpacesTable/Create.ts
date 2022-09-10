import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { v4 } from "uuid";

const dbClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;
async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  console.log("some string");

  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: "",
  };

  let item =
    typeof event.body == "object" ? event.body : JSON.parse(event.body);
  item.spaceId = v4();

  try {
    await dbClient
      .put({
        TableName: TABLE_NAME!,
        Item: item,
      })
      .promise();

    result.body = `item was created, id: ${item.spaceId}`;
  } catch (error: any) {
    result.statusCode = 500;
    result.body = error.message;
  }

  return result;
}

export { handler };
