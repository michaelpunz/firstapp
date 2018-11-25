import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import uuid from 'uuid/v4';
import { promisify } from 'util';

const s3 = new aws.S3({});

export const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    metadata: function(req, file, cb) {
      cb(null, file);
    },
    key: function(req, file, cb) {
      cb(null, `${req.params.folder}/${uuid()}`);
    }
  })
});

export function deleteFile(key: string) {
  const deleteObject = promisify<any, any>(s3.deleteObject);
  return deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: key });
}
