const bcrypt = require('bcrypt');
const { db } = require('../../utils/db');

const bucketName = 'travelah-storage';
function findUserByEmail(email) {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}

async function updateProfile(user, userId, destinationPath, photoOriginalName) {
  const updatedData = { ...user };

  if (destinationPath && photoOriginalName) {
    updatedData.profilePicPath = `https://storage.googleapis.com/${bucketName}/${destinationPath}`;
    updatedData.profilePicName = photoOriginalName;
  }

  return db.user.update({
    data: updatedData,
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
};
