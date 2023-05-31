const { db } = require('../../utils/db');
// function
function getSinglePost(postId) {
  return db.post.findUnique({
    where: {
      id: postId,
    },
  });
}
function getAllPost(page, take) {
  return db.post.findMany({
    skip: take * page,
    take,
  });
}

function getMostLikedPost() {
  return db.post.findMany({
    include: {
      _count: {
        select: {
          likes: true,
        },
        where: {
          likes: {
            some: {
              likeType: 'LIKE',
            },
          },
        },
      },
    },
    where: {
      likes: {
        some: {
          likeType: 'LIKE',
        },
      },
    },
    orderBy: {
      likes: {
        _count: 'desc',
      },
    },
    take: 2,
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
  getMostLikedPost,
};
