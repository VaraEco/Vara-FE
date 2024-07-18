import AWS from 'aws-sdk'; 
import S3 from 'aws-sdk/clients/s3';

const S3_BUCKET = "compliance-document-bucket"; // Replace with your bucket name
const REGION = "us-east-1"; // Replace with your region

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

export const s3 = new S3({
  params: { Bucket: S3_BUCKET },
  region: REGION,
});


// import { createClient } from "@supabase/supabase-js";
// import { mainConfig } from "./assets/Config/appConfig";

// const isLocal = window.location.hostname === 'localhost';

// if (isLocal) {
//     console.log('Running locally');
// } else {
//     console.log('Running on the cloud');
// }

// const supabaseUrl = mainConfig.REACT_APP_SUPABASE_URL;
// const supabaseKey = mainConfig.REACT_APP_SUPABASE_ANON_KEY;

// export const supabase = createClient(supabaseUrl, supabaseKey);