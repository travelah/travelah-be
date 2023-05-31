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

async function getMostLikedPost() {
  const posts = await db.post.findMany({
    orderBy: {
      likes: {
        _count: 'desc',
      },
    },
    take: 2,
  });

  const postIds = posts.map((post) => post.id);

  const likeCounts = await db.like.groupBy({
    by: ['postId'],
    where: {
      postId: {
        in: postIds,
      },
      likeType: 'LIKE',
    },
    _count: true,
  });

  const likeCountsMap = likeCounts.reduce((result, item) => {
    const map = { ...result };
    // eslint-disable-next-line no-underscore-dangle
    map[item.postId] = item._count;
    return map;
  }, {});

  const postsWithLikeCount = posts.map((post) => ({
    ...post,
    likeCount: likeCountsMap[post.id] || 0,
  }));

  return postsWithLikeCount;
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
