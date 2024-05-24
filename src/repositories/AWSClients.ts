import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const dbClient = new DynamoDBClient({});

export const docClient = DynamoDBDocumentClient.from(dbClient);

export const s3Client = new S3Client({});

export async function getPresignedURL(key: string): Promise<string> {
  const getObjectParams = {
    Bucket: "player-profiles",
    Key: key,
  };
  const command = new GetObjectCommand(getObjectParams);
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
