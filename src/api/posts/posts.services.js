const axios = require('axios');
const { db } = require('../../utils/db');
const { mapsApiKey } = require('../../../keys/mapsApiKey.json');

const { findUserById } = require('../users/users.services');

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
              profilePicName: true,
            },
          },
        },
      },
    },
  });
  if (!post) {
    throw new Error('Post not found!');
  }
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
      findUserById(post.userId),
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
  const posterFullName = user.fullName;
  const likeCount = likeCountsMap[post.id] || 0;
  const dontLikeCount = dontLikeCountsMap[post.id] || 0;

  return {
    ...post,
    profilePicOfUser,
    posterFullName,
    likeCount,
    dontLikeCount,
    commentCount,
    isUserLike: Boolean(isUserLike),
    isUserDontLike: Boolean(isUserDontLike),
  };
}

async function getAllComments(page, take, postId) {
  const post = await db.comment
    .findMany({
      skip: take * (page - 1),
      take,
      where: {
        postId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        user: {
          select: {
            fullName: true,
            profilePicPath: true,
            profilePicName: true,
          },
        },
      },
    })
    .then((comments) => {
      // Map the comments to include userFullName directly
      const mappedComments = comments.map((comment) => ({
        ...comment,
        userFullName: comment.user.fullName,

        userProfilePicPath: comment.user?.profilePicPath
          ? `${comment.user?.profilePicPath}/${comment.user.profilePicName}`
          : null,
      }));

      // Return the mapped comments
      return mappedComments;
    });
  if (!post) {
    throw new Error('Post not found!');
  }

  return post;
}

async function getMyPost(page, take, userId) {
  const postsRetrieved = await db.$transaction(async () => {
    const posts = await db.post.findMany({
      skip: take * (page - 1),
      take,
      where: {
        userId,
      },
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

        const user = await findUserById(post.userId);

        const profilePicOfUser = user?.profilePicPath
          ? `${user.profilePicPath}/${user.profilePicName}`
          : null;
        const posterFullName = user.fullName;

        const likeCount = likeCountsMap[post.id] || 0;
        const dontLikeCount = dontLikeCountsMap[post.id] || 0;

        return {
          ...post,
          posterFullName,
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
async function getAllPost(page, take, userId) {
  const postsRetrieved = await db.$transaction(async () => {
    const posts = await db.post.findMany({
      skip: take * (page - 1),
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

        const user = await findUserById(post.userId);

        const profilePicOfUser = user?.profilePicPath
          ? `${user.profilePicPath}/${user.profilePicName}`
          : null;
        const posterFullName = user.fullName;

        const likeCount = likeCountsMap[post.id] || 0;
        const dontLikeCount = dontLikeCountsMap[post.id] || 0;

        return {
          ...post,
          posterFullName,
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
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=true&key=${apiKey}`;
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

        const user = await findUserById(post.userId);

        const profilePicOfUser = user?.profilePicPath
          ? `${user.profilePicPath}/${user.profilePicName}`
          : null;
        const posterFullName = user.fullName;

        const likeCount = likeCountsMap[post.id] || 0;
        const dontLikeCount = dontLikeCountsMap[post.id] || 0;

        return {
          ...post,
          posterFullName,
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
  title,
  desc,
  latitude,
  longitude,
  destinationPath,
  photoOriginalName,
) {
  // eslint-disable-next-line operator-linebreak
  const location =
    latitude && longitude
      ? await getLocationName(Number(latitude), Number(longitude))
      : null;
  return db.post.create({
    data: {
      user: {
        connect: { id: userId },
      },
      title,
      description: desc,
      location,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      postPhotoPath: destinationPath,
      postPhotoName: photoOriginalName,
    },
  });
}
async function deletePost(postId) {
  const post = await db.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new Error('Post not found!');
  }

  return db.post.delete({
    where: {
      id: postId,
    },
  });
}
async function updatePost(postId, data) {
  const post = await db.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new Error('Post not found!');
  }
  return db.post.update({
    where: {
      id: postId,
    },
    data: {
      ...data,
    },
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
  unlikePost,
  getMyPost,
  getAllComments,
  getLocationName,
};
