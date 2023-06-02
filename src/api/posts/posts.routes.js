const express = require('express');
const multer = require('multer');
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
} = require('./posts.services');
const { isAuthenticated } = require('../../middleware/middleware');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
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

router.post('/like/:postId', isAuthenticated, async (req, res, next) => {
  try {
    const { likeType } = req.query;
    const postId = parseInt(req.params.postId, 10);
    const { userId } = req;
    const userLikeCheck = await checkIfUserAlreadyLikeAPost(userId, postId);
    if (userLikeCheck === null) {
      const postLiked = await likePost(userId, postId, likeType);
      res.status(200).json({
        data: postLiked,
        message: `Post with id ${postId} has been liked or Disliked`,
        status: true,
      });
    } else {
      throw new Error('You already liked or dont liked this post');
    }
  } catch (err) {
    next(err);
  }
});

router.delete('/like/:postId', isAuthenticated, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId, 10);

    const post = await getSinglePost(postId);
    if (!post) {
      throw new Error(`there is no post with id of ${postId}`);
    }
    const { userId } = req;
    console.log(postId, userId);
    const userLikeCheck = await checkIfUserAlreadyLikeAPost(userId, postId);
    console.log(userLikeCheck);
    if (userLikeCheck !== null) {
      const postLiked = await unlikePost(userId, postId);
      res.status(200).json({
        data: postLiked,
        message: `Post with id ${postId} has been unliked or un-dont like`,
        status: true,
      });
    } else {
      throw new Error('You never like or dont like this post');
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
      const {
        description,
        location: { latitude, longitude },
      } = req.body;
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

      const { userId } = req;

      const photo = req.file;
      if (!photo) {
        res.status(400).json({ error: 'No photo provided' });
        return;
      }

      // Process the photo and save it to Google Cloud Storage
      const photoPath = photo.path;
      const destinationPath = `post-photos/${photo.originalname}`;

      const post = await createPost(
        userId,
        description,
        latitude,
        longitude,
        photoPath,
        destinationPath,
        photo.originalname,
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
    const post = await getSinglePost(postId);
    if (!post || post.userId !== userId) {
      throw new Error('You are not authorized to delete this post.');
    }

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
    const post = await getSinglePost(postId);
    if (!post || post.userId !== userId) {
      throw new Error('You are not authorized to update this post.');
    }
    if (!req.body.location) {
      const { description } = req.body;
      data = {
        description,
      };
    } else if (!req.body.description) {
      const {
        location: { latitude, longitude },
      } = req.body;
      data = {
        location: {
          latitude,
          longitude,
        },
      };
    } else if (req.body.location && req.body.description) {
      const {
        description,
        location: { latitude, longitude },
      } = req.body;
      data = {
        description,
        location: {
          latitude,
          longitude,
        },
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
