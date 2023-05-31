const { db } = require('../../utils/db');
// function
function getSinglePost(postId) {
  return db.post.findUnique({
    where: {
      id: postId,
    },
  });
}
async function getAllPost(page, take) {
  const posts = await db.post.findMany({
    skip: take * page,
    take,
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

  const dontLikeCounts = await db.like.groupBy({
    by: ['postId'],
    where: {
      postId: {
        in: postIds,
      },
      likeType: 'DONTLIKE',
    },
    _count: true,
  });

  const likeCountsMap = likeCounts.reduce((result, item) => {
    const map = { ...result };
    // eslint-disable-next-line no-underscore-dangle
    map[item.postId] = item._count;
    return map;
  }, {});

  const dontLikeCountsMap = dontLikeCounts.reduce((result, item) => {
    const map = { ...result };
    // eslint-disable-next-line no-underscore-dangle
    map[item.postId] = item._count;
    return map;
  }, {});

  const postsWithLikeAndDontLikeCount = posts.map((post) => ({
    ...post,
    likeCount: likeCountsMap[post.id] || 0,
    dontLikeCount: dontLikeCountsMap[post.id] || 0,
  }));

  return postsWithLikeAndDontLikeCount;
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

function likePost(userId, postId, likeType) {
  return db.like.create({
    data: {
      user: {
        connect: { id: userId },
      },
      post: {
        connect: { id: postId },
      },
      likeType,
    },
  });
}

function commentPost(userId, postId, description) {
  return db.comment.create({
    data: {
      user: {
        connect: { id: userId },
      },
      post: {
        connect: { id: postId },
      },
      description,
    },
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
  likePost,
  commentPost,
};
