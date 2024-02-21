import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const config = {
  region: process.env.AWS_REGION as string,
};
const bucket = process.env.AWS_BUCKET_NAME as string;

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string
) {
  console.log(`putting ${key} in ${bucket}`);
  const client = new S3Client(config);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  return await client.send(command);
}

export async function deleteObject(key: string) {
  console.log(`deleting ${key} in ${bucket}`);
  const client = new S3Client(config);
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
  return await client.send(command);
}

export async function getObject(key: string) {
  console.log(`getting ${key} in ${bucket}`);
  const client = new S3Client(config);
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return await client.send(command);
}
