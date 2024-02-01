import { DynamoDB } from "@aws-sdk/client-dynamodb";

const region = process.env.AWS_REGION as string;
const tableName = "myclip-dev";

interface Item {
  id: string;
  data?: string;
  type?: string;
  timestamp: string;
}

interface Output {
  lastItem: Item | null;
  data: Item[];
}

export async function getDataList(
  id: string,
  lastItemTimestamp?: string
): Promise<Output> {
  const client = new DynamoDB({ region });
  const result = await client.query({
    TableName: tableName,
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: { ":id": { S: id } },
    Limit: 5,
    ScanIndexForward: false, // Sort by timestamp in descending order
  });

  const data = result.Items?.map((item) => {
    return {
      id: item.id.S as string,
      data: item.data.S as string,
      type: item.type.S as string,
      timestamp: item.timestamp.N as string,
    };
  });
  const lastItem = result.LastEvaluatedKey
    ? {
        id: result.LastEvaluatedKey.id.S as string,
        timestamp: result.LastEvaluatedKey.timestamp.N as string,
      }
    : null;

  return {
    lastItem,
    data: data !== undefined ? data : [],
  };
}

export async function putItem(id: string, data: string, type: string) {
  const client = new DynamoDB({ region });
  const time = Date.now();
  await client.putItem({
    TableName: tableName,
    Item: {
      id: { S: id },
      data: { S: data },
      type: { S: type },
      timestamp: { N: `${time}` },
    },
  });
}
