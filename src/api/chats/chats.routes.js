const express = require('express');
const axios = require('axios');
const {
  getChat,
  getGroupChat,
  createGroupChat,
  getAllGroup,
  createChatbyGroup,
  deleteChat,
  deleteGroupChat,
  bookmarkChat,
  unbookmarkChat,
  checkIfUserAlreadyBookmarkedAChat,
} = require('./chats.services');
const { isAuthenticated } = require('../../middleware/middleware');

const router = express.Router();
// get GroupChatbyId
router.get('/group/:groupId', isAuthenticated, async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
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
    const group = await getGroupChat(groupId, page, take);
    res.status(200).json({
      data: group,
      message: `GroupChat with id ${groupId} has been retrieved`,
      status: true,
    });
  } catch (err) {
    next(err);
  }
});
// get all group
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req;
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
    const group = await getAllGroup(page, take, userId);

    res.status(200).json({
      data: group,
      message: 'Your Group Chat with also the latest chat has been retrieved',
      status: true,
    });
  } catch (err) {
    next(err);
  }
});

// create groupchat
router.post('/group', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req;
    const group = await createGroupChat(userId);

    res.status(201).json({
      data: group,
      message: 'New Group Chat has been created',
      status: true,
    });
  } catch (err) {
    next(err);
  }
});
// create chat by groupId
router.post('/:groupId', isAuthenticated, async (req, res, next) => {
  try {
    const { question } = req.body;
    const { userId } = req;
    const groupId = parseInt(req.params.groupId, 10);

    if (!question || !groupId) {
      res.status(400);
      throw new Error('You must provide a complete attribute');
    }

    const requestData = {
      userUtterance: question,
    };
    const mlEndpoint = 'https://appml-h7wjymk3wa-uc.a.run.app/predict';
    const mlResponse = await axios.post(mlEndpoint, requestData);
    const {
      altIntent1, altIntent2, chatType, predictedResponse,
    } = mlResponse.data;

    const chat = await createChatbyGroup(
      question,
      predictedResponse,
      chatType,
      groupId,
      userId,
    );

    res.status(201).json({
      data: {
        chat,
        altIntent1,
        altIntent2,
      },
      message: 'New Chat has been created',
      status: true,
    });
  } catch (err) {
    next(err);
  }
});
// bookmark single chat
router.patch('/:chatId', isAuthenticated, async (req, res, next) => {
  try {
    const chatId = parseInt(req.params.chatId, 10);
    const isBookmarked = await checkIfUserAlreadyBookmarkedAChat(chatId);
    if (isBookmarked === null) {
      console.log(chatId);
      const bookmarkedChat = await bookmarkChat(chatId);
      res.status(201).json({
        data: bookmarkedChat,
        message: `Chat with id ${chatId} has been bookmarked`,
        status: true,
      });
    } else {
      const unbookmarkedChat = await unbookmarkChat(chatId);
      res.status(201).json({
        data: unbookmarkedChat,
        message: `Chat with id ${chatId} has been unbookmarked`,
        status: true,
      });
    }
  } catch (err) {
    next(err);
  }
});

// delete single chat
router.delete('/:chatId', isAuthenticated, async (req, res, next) => {
  try {
    const chatId = parseInt(req.params.chatId, 10);

    const chatDel = await deleteChat(chatId);
    res.status(201).json({
      data: chatDel,
      message: `Chat with id ${chatId} has been deleted`,
      status: true,
    });
  } catch (err) {
    next(err);
  }
});
// delete group chat
router.delete('/group/:groupId', isAuthenticated, async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);

    await deleteGroupChat(groupId);
    res.status(201).json({
      message: `Group Chat with id ${groupId} has been deleted`,
      status: true,
    });
  } catch (err) {
    next(err);
  }
});
module.exports = router;
