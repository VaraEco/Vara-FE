import AWS from 'aws-sdk'; 
import S3 from 'aws-sdk/clients/s3';

const S3_BUCKET = "compliance-document-bucket"; // Replace with your bucket name
const REGION = "us-east-1"; // Replace with your region

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
});

export const s3 = new S3({
  params: { Bucket: S3_BUCKET },
  region: REGION,
});
