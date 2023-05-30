const express = require('express');
const {
  getChat,
  getGroupChat,
  createGroupChat,
  getAllGroup,
  createChatbyGroup,
  deleteChat,
  deleteGroupChat,
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
    }
    if (!take) {
      take = 5;
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
    let { page, take } = req.query;
    if (!page) {
      page = 1;
    }
    if (!take) {
      take = 5;
    }
    const group = await getAllGroup(page, take);

    res.status(200).json({
      data: group,
      message: 'Latest Group Chat has been retrieved',
      status: true,
    });
  } catch (err) {
    next(err);
  }
});

// create groupchat
router.post('/group', isAuthenticated, async (req, res, next) => {
  try {
    const group = await createGroupChat();

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
    const { question, response, chatType } = req.body;
    const groupId = parseInt(req.params.groupId, 10);
    if (!question || !response || !chatType || !groupId) {
      res.status(400);
      throw new Error('You must provide a complete attribute');
    }
    const chat = await createChatbyGroup(question, response, chatType, groupId);

    res.status(201).json({
      data: chat,
      message: 'New Chat has been created',
      status: true,
    });
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
