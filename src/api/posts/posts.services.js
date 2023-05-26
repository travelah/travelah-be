const { db } = require('../../utils/db');
// function
function getSinglePost(postId) {
  return db.post.findUnique({
    where: {
      id: postId,
    },
  });
}
function getAllPost(post) {
  return db.post.findMany({
    data: post,
  });
}
function createPost(userId, desc, loc) {
  return db.post.create({
    data: {
      user: {
        connect: { id: userId },
      },
      description: desc,
      location: loc,
    },
  });
}
function deletePost(postId) {
  return db.post.delete({
    where: {
      id: postId,
    },
  });
}
function updatePost(iduser, postId, data) {
  return db.post.update({
    where: {
      id: postId,
    },
    data,
  });
}
module.exports = {
  createPost,
  getAllPost,
  getSinglePost,
  deletePost,
  updatePost,
};
