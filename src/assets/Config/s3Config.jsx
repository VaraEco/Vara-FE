// import AWS from 'aws-sdk'; 
// import S3 from 'aws-sdk/clients/s3';

// const S3_BUCKET = "compliance-document-bucket"; // Replace with your bucket name
// const REGION = "us-east-1"; // Replace with your region

// AWS.config.update({
//   accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
// });

// export const s3 = new S3({
//   params: { Bucket: S3_BUCKET },
//   region: REGION,
// });
// import * as aws_methods from "@aws-sdk/credential-providers";
// import React from 'react';
// // const { fromIni } = require("@aws-sdk/credential-providers");
// const path = require('path');

// import { SESClient } from "@aws-sdk/client-ses";
// import { S3Client } from "@aws-sdk/client-s3";
// import { Upload } from "@aws-sdk/lib-storage";

// const awsCredentialsPath = path.join(__dirname,'/../../aws/credentials');
// const awsConfigPath = path.join(__dirname,'/../../aws/config');

// const awsConfigEnv = aws_methods.fromIni({
//   filepath: awsCredentialsPath,
//   configFilepath: awsConfigPath,
//   profile: 'default'
// })
// const SES = new SESClient({region: "us-east-1", credentials: awsConfigEnv});

// export const uploadToS3 = (filePath, bucket, key) => {
//   const s3Stream = new PassThrough();
//   // pipe file and s3 stream to upload
//   fs.createReadStream(filePath, {highWaterMark: 1024 * 16}).pipe(s3Stream);

//   console.log(aws_methods)
//   const upload = new Upload({
//     client: new S3Client({region, credentials: awsConfigEnv}),params: {
//       Bucket: bucket,
//       Key: key,
//       Body: s3Stream,
//     }
//   });

//   return upload.done()
//   .then(_ => `${bucket}/${key}`)
//   .catch(e => {
//     console.error("unable to upload", e);
//   })
// };
