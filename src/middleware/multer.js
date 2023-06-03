const multer = require('multer');
const path = require('path');
const multerGoogleStorage = require('multer-google-storage');
const { Storage } = require('@google-cloud/storage');

const keyFilename = path.join(__dirname, '../../keys/BucketCredential.json');
// const storage = new Storage({
//   credentials: bucketServiceAccount,
// });
const bucketName = 'travelah-storage';
const projectId = 'travelah-388302';

// Configure the Multer storage engine for Google Cloud Storage
const storage = new Storage({
  keyFilename,
  projectId,
});

const bucket = storage.bucket(bucketName);

// Create the Multer middleware
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1000 * 1000,
  },
});

function uploadToStorage(file, folderName, timestamp) {
  return new Promise((resolve, reject) => {
    if (!file) {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject('No file uploaded');
    }

    const { originalname, buffer } = file;
    const fileName = `${timestamp}-${originalname}`;
    const fileLocation = `${folderName}/${fileName}`;

    const blob = bucket.file(fileLocation);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', (error) => {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject(`Error uploading file: ${error}`);
    });

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileLocation}`;
      resolve(publicUrl);
    });

    blobStream.end(buffer);
  });
}

module.exports = {
  upload,
  uploadToStorage,
};
