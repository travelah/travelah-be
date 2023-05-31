const express = require('express');
const {
  createPost,
  getAllPost,
  getSinglePost,
  deletePost,
  updatePost,
  getMostLikedPost,
} = require('./posts.services');
const { isAuthenticated } = require('../../middleware/middleware');

const router = express.Router();

router.get('/detail/:postId', isAuthenticated, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const post = await getSinglePost(postId);
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
    const post = await getAllPost(page, take);
    res.status(200).json({
      data: post,
      message: 'All Post has been retrieved',
      status: true,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/most-liked', isAuthenticated, async (req, res, next) => {
  try {
    const post = getMostLikedPost;
    res.status(200).json({
      data: post,
      message: '2 most liked post has been retrieved',
      status: true,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const { description, location } = req.body;
    if (!description || !location) {
      res.status(400);
      throw new Error('You must provide an description and location.');
    }

    const { userId } = req;
    const post = await createPost(userId, description, location);

    res.status(201).json({
      data: post,
      message: 'New Post has been created',
      status: true,
    });
  } catch (err) {
    next(err);
  }
});
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
    const postId = parseInt(req.params.postId, 10);
    const { userId } = req;
    const post = await getSinglePost(postId);
    if (!post || post.userId !== userId) {
      throw new Error('You are not authorized to update this post.');
    }
    const { description, location } = req.body;
    // if (!description || !location) {
    //   res.status(400);
    //   throw new Error('You must provide an description and location.');
    // }
    const data = {};

    if (description) {
      data.description = description;
    }

    if (location) {
      data.location = location;
    }

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
