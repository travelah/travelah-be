const express = require('express');

const auth = require('./auth/auth.routes');
const users = require('./users/users.routes');
const posts = require('./posts/posts.routes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - Connect Succeed',
  });
});

router.use('/auth', auth);
router.use('/users', users);
router.use('/posts', posts);

module.exports = router;
