const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { Storage } = require('@google-cloud/storage');
const { db } = require('../../utils/db');
const { mapsApiKey } = require('../../../keys/mapsApiKey.json');

const { findUserById } = require('../users/users.services');

const bucketServiceAccount = require('../../../keys/BucketCredential.json');

const publicUrl = 'https://storage.googleapis.com/$bucketName/$objectPath';

const storage = new Storage({
  credentials: bucketServiceAccount,
});
const bucketName = 'travelah-storage';
// function
async function getSinglePost(postId, userId) {
  const post = await db.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      comments: {
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          user: {
            select: {
              fullName: true,
              profilePicPath: true,
            },
          },
        },
      },
    },
  });

  const likeTypes = ['LIKE', 'DONTLIKE'];

  // eslint-disable-next-line operator-linebreak
  const [likeCounts, isUserLike, isUserDontLike, commentCount, user] =
    await db.$transaction([
      db.like.groupBy({
        by: ['postId', 'likeType'], // Include 'likeType' in the grouping
        where: {
          postId,
          likeType: { in: likeTypes },
        },
        _count: true,
      }),
      db.like.findFirst({
        where: {
          postId: post.id,
          userId,
          likeType: 'LIKE',
        },
      }),
      db.like.findFirst({
        where: {
          postId: post.id,
          userId,
          likeType: 'DONTLIKE',
        },
      }),
      db.comment.count({
        where: {
          postId: post.id,
        },
      }),
      findUserById(userId),
    ]);

  const likeCountsMap = {};
  const dontLikeCountsMap = {};

  likeCounts.forEach((item) => {
    const { likeType, _count } = item;

    if (likeType === 'LIKE') {
      likeCountsMap[postId] = _count;
    } else if (likeType === 'DONTLIKE') {
      dontLikeCountsMap[postId] = _count;
    }
  });

  const profilePicOfUser = user?.profilePicPath
    ? `${user.profilePicPath}/${user.profilePicName}`
    : null;
  const userFullName = user.fullName;
  const likeCount = likeCountsMap[post.id] || 0;
  const dontLikeCount = dontLikeCountsMap[post.id] || 0;

  return {
    ...post,
    profilePicOfUser,
    userFullName,
    likeCount,
    dontLikeCount,
    commentCount,
    isUserLike: Boolean(isUserLike),
    isUserDontLike: Boolean(isUserDontLike),
  };
}

async function getAllPost(page, take, userId) {
  const postsRetrieved = await db.$transaction(async () => {
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

    const postsWithLikeAndDontLikeCount = await Promise.all(
      posts.map(async (post) => {
        const isUserLike = await db.like.findFirst({
          where: {
            postId: post.id,
            userId,
            likeType: 'LIKE',
          },
        });

        const isUserDontLike = await db.like.findFirst({
          where: {
            postId: post.id,
            userId,
            likeType: 'DONTLIKE',
          },
        });

        const commentCount = await db.comment.count({
          where: {
            postId: post.id,
          },
        });

        const user = await findUserById(userId);

        const profilePicOfUser = user?.profilePicPath
          ? `${user.profilePicPath}/${user.profilePicName}`
          : null;
        const userFullName = user.fullName;

        const likeCount = likeCountsMap[post.id] || 0;
        const dontLikeCount = dontLikeCountsMap[post.id] || 0;

        return {
          ...post,
          userFullName,
          profilePicOfUser,
          likeCount,
          dontLikeCount,
          commentCount,
          isUserLike: Boolean(isUserLike),
          isUserDontLike: Boolean(isUserDontLike),
        };
      }),
    );

    return postsWithLikeAndDontLikeCount;
  });

  return postsRetrieved;
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

async function getMostLikedPost(userId) {
  const postWithMostLikedRetrieved = await db.$transaction(async () => {
    const posts = await db.post.findMany({
      orderBy: {
        likes: {
          _count: 'desc',
        },
      },
      take: 3,
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

    const postsWithLikeAndDontLikeCount = await Promise.all(
      posts.map(async (post) => {
        const isUserLike = await db.like.findFirst({
          where: {
            postId: post.id,
            userId,
            likeType: 'LIKE',
          },
        });

        const isUserDontLike = await db.like.findFirst({
          where: {
            postId: post.id,
            userId,
            likeType: 'DONTLIKE',
          },
        });

        const commentCount = await db.comment.count({
          where: {
            postId: post.id,
          },
        });

        const user = await findUserById(userId);

        const profilePicOfUser = user?.profilePicPath
          ? `${user.profilePicPath}/${user.profilePicName}`
          : null;
        const userFullName = user.fullName;

        const likeCount = likeCountsMap[post.id] || 0;
        const dontLikeCount = dontLikeCountsMap[post.id] || 0;

        return {
          ...post,
          userFullName,
          profilePicOfUser,
          likeCount,
          dontLikeCount,
          commentCount,
          isUserLike: Boolean(isUserLike),
          isUserDontLike: Boolean(isUserDontLike),
        };
      }),
    );

    return postsWithLikeAndDontLikeCount;
  });

  return postWithMostLikedRetrieved;
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

function unlikePost(userId, postId) {
  return db.like.deleteMany({
    where: {
      userId,
      postId,
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

async function createPost(
  userId,
  desc,
  latitude,
  longitude,
  photoPath,
  destinationPath,
  photoOriginalName,
) {
  const location = await getLocationName(latitude, longitude);
  const bucket = storage.bucket(bucketName);

  // Generate a unique file name using UUID and preserve the file extension
  const uniqueFileName = `${uuidv4()}.jpg`; // Change the extension if the file is in a different format

  const file = await bucket.upload(photoPath, {
    destination: `${destinationPath}/${uniqueFileName}`,
  });

  const uploadedFile = file[0];
  const filePath = `https://storage.googleapis.com/${bucketName}/${uploadedFile.name}`;

  return db.post.create({
    data: {
      user: {
        connect: { id: userId },
      },
      description: desc,
      location,
      latitude,
      longitude,
      postPhotoPath: filePath,
      postPhotoName: `${photoOriginalName}/${uniqueFileName}`,
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
async function updatePost(iduser, postId, data) {
  if (data.description && data.location) {
    const location = await getLocationName(
      data.location.latitude,
      data.location.longitude,
    );
    return db.post.update({
      where: {
        id: postId,
      },
      data: {
        description: data.description,
        location,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
      },
    });
  }
  if (!data.description && data.location.latitude && data.location.longitude) {
    console.log('masuk sini kah 2');
    const location = await getLocationName(
      data.location.latitude,
      data.location.longitude,
    );
    return db.post.update({
      where: {
        id: postId,
      },
      data: {
        location,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
      },
    });
  }
  if (data.description) {
    console.log('masuk sini kah 3');
    return db.post.update({
      where: {
        id: postId,
      },
      data: {
        description: data.description,
      },
    });
  }

  return null;
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
  unlikePost,
};
