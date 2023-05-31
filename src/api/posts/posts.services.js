const axios = require('axios');
const { db } = require('../../utils/db');
const { mapsApiKey } = require('../../../keys/mapsApiKey.json');
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

async function getLocationName(latitude, longitude) {
  try {
    const apiKey = mapsApiKey;
    console.log(latitude, longitude);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=true&key=${apiKey}`;
    console.log(url);
    const response = await axios.get(url);

    if (response.data.results.length > 0) {
      const locationName = response.data.results[0].formatted_address;
      return locationName;
    }
    throw new Error('No location found for the given coordinates.');
  } catch (error) {
    console.error('Error retrieving location:', error);
    throw error;
  }
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

function checkIfUserAlreadyLikeAPost(userId, postId) {
  return db.like.findFirst({
    where: {
      postId,
      userId,
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

async function createPost(userId, desc, latitude, longitude) {
  const location = await getLocationName(latitude, longitude);
  return db.post.create({
    data: {
      user: {
        connect: { id: userId },
      },
      description: desc,
      location,
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
  checkIfUserAlreadyLikeAPost,
};
