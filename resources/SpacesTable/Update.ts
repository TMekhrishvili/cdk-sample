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

  const requestBody =
    typeof event.body == "object" ? event.body : JSON.parse(event.body);
  const spaceId = event.queryStringParameters?.[PRIMARY_KEY];
  const requestBodyKey = Object.keys(requestBody)[0];
  const requestBodyValue = requestBody[requestBodyKey];

  try {
    const updatedResult = dbClient.update({
      TableName: TABLE_NAME,
      Key: {
        [PRIMARY_KEY]: spaceId,
      },
      UpdateExpression: "set #zzzNew = :new",
      ExpressionAttributeValues: {
        ":new": requestBodyValue,
      },
      ExpressionAttributeNames: {
        "#zz": requestBodyKey,
      },
      ReturnValues: "UPDATED_NEW",
    });
    console.log(updatedResult);

    result.body = "item was updated";
  } catch (error: any) {
    result.statusCode = 500;
    result.body = error.message;
  }

  return result;
}

export { handler };
