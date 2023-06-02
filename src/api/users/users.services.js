const bcrypt = require('bcrypt');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../../utils/db');
const bucketServiceAccount = require('../../../keys/BucketCredential.json');

// Specify the path to your credentials file
// const keyFilename = path.resolve(
//   __dirname,
//   '../../../keys/bucketCredential.json',
// );
const publicUrl = 'https://storage.googleapis.com/$bucketName/$objectPath';

const storage = new Storage({
  credentials: bucketServiceAccount,
});
const bucketName = 'travelah-storage';
function findUserByEmail(email) {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}

async function uploadProfilephoto(
  photoPath,
  destinationPath,
  userId,
  photoOriginalName,
) {
  const bucket = storage.bucket(bucketName);

  // Generate a unique file name using UUID and preserve the file extension
  const uniqueFileName = `${uuidv4()}.jpg`; // Change the extension if the file is in a different format

  const file = await bucket.upload(photoPath, {
    destination: `${destinationPath}/${uniqueFileName}`,
  });

  const uploadedFile = file[0];
  const filePath = `https://storage.googleapis.com/${bucketName}/${uploadedFile.name}`;

  return db.user.update({
    data: {
      profilePicPath: filePath,
      profilePicName: `${photoOriginalName}/${uniqueFileName}`,
    },
    where: {
      id: userId,
    },
  });
}

async function updateProfile(user, userId) {
  return db.user.update({
    data: user,
    where: {
      id: userId,
    },
  });
}

function createUserByEmailAndPassword(user) {
  /* eslint no-param-reassign: "error" */
  user.password = bcrypt.hashSync(user.password, 12);
  return db.user.create({
    data: user,
  });
}

function createUserOnlyByEmail(user) {
  /* eslint no-param-reassign: "error" */
  return db.user.create({
    data: user,
  });
}

function findUserById(id) {
  return db.user.findUnique({
    where: {
      id,
    },
  });
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUserByEmailAndPassword,
  createUserOnlyByEmail,
  updateProfile,
  uploadProfilephoto,
};
