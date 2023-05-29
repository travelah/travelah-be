const express = require('express');
const { isAuthenticated } = require('../../middleware/middleware');
const { findUserById } = require('./users.services');

const router = express.Router();

router.get('/profile', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req.payload;
    const user = await findUserById(userId);
    delete user.password;
    res.json({
      data: user,
      message: 'Success retrieve your profile',
      status: true,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
