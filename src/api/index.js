const express = require('express');

const request = require('request');
const axios = require('axios');
const auth = require('./auth/auth.routes');
const users = require('./users/users.routes');
const posts = require('./posts/posts.routes');
const chats = require('./chats/chats.routes').router;

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - Connect Succeed',
  });
});

router.get('/home', (req, res) => {
  request.get('http://127.0.0.1:5000/flask', (error, response, body) => {
    console.error('error:', error); // Print the error
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the data received
    res.send(body); // Display the response on the website
  });
});
router.use('/auth', auth);
router.use('/users', users);
router.use('/posts', posts);
router.use('/chats', chats);

module.exports = router;
