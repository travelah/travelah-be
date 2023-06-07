const express = require('express');
const {
  createPost,
  getAllPost,
  getSinglePost,
  deletePost,
  updatePost,
  getMostLikedPost,
  likePost,
  unlikePost,
  commentPost,
  checkIfUserAlreadyLikeAPost,
  getMyPost,
} = require('./posts.services');
const { isAuthenticated } = require('../../middleware/middleware');
const { uploadToStorage, upload } = require('../../middleware/multer');

const router = express.Router();
router.get('/detail/:postId', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req;
    const postId = parseInt(req.params.postId, 10);
    const post = await getSinglePost(postId, userId);
    res.status(200).json({
      data: post,
      message: `Post with id ${postId} has been retrieved`,
      status: true,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    let { page, take } = req.query;
    if (!page) {
      page = 1;
    } else {
      page = parseInt(page, 10);
    }
    if (!take) {
      take = 5;
    } else {
      take = parseInt(take, 10);
    }
    const { userId } = req;
    const post = await getAllPost(page, take, userId);
    res.status(200).json({
      data: post,
      message: 'All Post has been retrieved',
      status: true,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/mypost', isAuthenticated, async (req, res, next) => {
  try {
    let { page, take } = req.query;
    if (!page) {
      page = 1;
    } else {
      page = parseInt(page, 10);
    }
    if (!take) {
      take = 5;
    } else {
      take = parseInt(take, 10);
    }
    const { userId } = req;
    const post = await getMyPost(page, take, userId);
    res.status(200).json({
      data: post,
      message: 'All of your post has been retrieved',
      status: true,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/like/:postId', isAuthenticated, async (req, res, next) => {
  try {
    const { likeType } = req.query;
    const postId = parseInt(req.params.postId, 10);
    const post = await getSinglePost(postId);
    if (!post) {
      throw new Error(`there is no post with id of ${postId}`);
    }
    const { userId } = req;
    const userLikeCheck = await checkIfUserAlreadyLikeAPost(userId, postId);
    if (userLikeCheck === null) {
      const postLiked = await likePost(userId, postId, likeType);
      res.status(200).json({
        data: postLiked,
        message: `Post with id ${postId} has been liked or Disliked`,
        status: true,
      });
    } else if (userLikeCheck.likeType === likeType) {
      const postUnliked = await unlikePost(userId, postId);
      res.status(200).json({
        data: {
          cancelLike: postUnliked,
        },
        message: `Post with id ${postId} has been unliked or un-disliked`,
        status: true,
      });
    } else if (userLikeCheck.likeType !== likeType) {
      const postUnliked = await unlikePost(userId, postId);
      const postLiked = await likePost(userId, postId, likeType);
      res.status(200).json({
        data: {
          cancelLike: postUnliked,
          like: postLiked,
        },
        message: `Post with id ${postId} has been liked or Disliked`,
        status: true,
      });
    }
  } catch (err) {
    next(err);
  }
});

router.post('/comment/:postId/', isAuthenticated, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const { userId } = req;
    const { description } = req.body;
    const postCommented = await commentPost(userId, postId, description);

    res.status(200).json({
      data: postCommented,
      message: `Post with id ${postId} has been commented`,
      status: true,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/most-liked', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req;
    const post = await getMostLikedPost(userId);

    res.status(200).json({
      data: post,
      message: '2 most liked post has been retrieved',
      status: true,
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  isAuthenticated,
  upload.single('photo'),
  async (req, res, next) => {
    try {
      const { description, latitude, longitude } = req.body;
      console.log(req.body);
      if (!description) {
        res.status(400);
        console.log(description, latitude, longitude);
        throw new Error('You must provide an description');
      }
      if (!latitude && !longitude) {
        res.status(400);
        throw new Error('You must provide an latitude and longitude');
      }
      const timestamp = new Date().getTime();
      console.log('sampe sini');
      const { userId } = req;

      const photo = req.file;
      if (!photo) {
        res.status(400).json({ error: 'No photo provided' });
        return;
      }

      // Process the photo and save it to Google Cloud Storage
      const destinationPath = 'public/images'; // Specify the desired folder name

      await uploadToStorage(photo, destinationPath, timestamp);

      const post = await createPost(
        userId,
        description,
        latitude,
        longitude,
        destinationPath,
        `${timestamp}-${photo.originalname}`,
      );

      res.status(201).json({
        data: post,
        message: 'New Post has been created',
        status: true,
      });
    } catch (err) {
      next(err);
    }
  },
);
router.delete('/:postId', isAuthenticated, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const { userId } = req;
    const post = await getSinglePost(postId, userId);
    if (!post || post.userId !== userId) {
      throw new Error('You are not authorized to delete this post.');
    }
    console.log(post, post.userId, userId);

    const postDel = await deletePost(postId);
    res.status(201).json({
      data: postDel,
      message: `Post with id ${postId} has been deleted`,
      status: true,
    });
  } catch (err) {
    next(err);
  }
});
router.patch('/:postId', isAuthenticated, async (req, res, next) => {
  try {
    let data;
    const postId = parseInt(req.params.postId, 10);
    const { userId } = req;
    const post = await getSinglePost(postId, userId);
    if (!post || post.userId !== userId) {
      throw new Error('You are not authorized to update this post.');
    }
    if (!req.body.location) {
      const { description } = req.body;
      data = {
        description,
      };
    } else if (!req.body.description) {
      const { latitude, longitude } = req.body;
      data = {
        latitude,
        longitude,
      };
    } else if (req.body.location && req.body.description) {
      const { description, latitude, longitude } = req.body;
      data = {
        description,
        latitude,
        longitude,
      };
    }
    console.log(data);
    const postNew = await updatePost(userId, postId, data);

    res.status(200).json({
      data: postNew,
      message: `Post with id ${postId} has been updated`,
      status: true,
    });
  } catch (err) {
    next(err);
  }
});
module.exports = router;
