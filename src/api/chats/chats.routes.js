const express = require('express');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const router = express.Router();
const httpServer = require('http').createServer(router);
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

const io = socketIO(httpServer);

// Enable CORS
// const corsOptions = {
//   origin: 'https://demo-app-h7wjymk3wa-uc.a.run.app', // Replace with your frontend domain
//   optionsSuccessStatus: 200,
// };
// app.use(cors(corsOptions));

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  // Handle different events
  socket.on('createGroupChat', isAuthenticated, async (data) => {
    try {
      const group = await createGroupChat(data.userId);

      // Emit the created group chat data back to the client
      socket.broadcast.emit('groupChatCreated', {
        data: group,
        message: 'New Group Chat has been created',
        status: true,
      });
    } catch (err) {
      socket.emit('groupChatCreationError', { message: err.message });
    }
  });

  socket.on('getGroupChat', isAuthenticated, async (data) => {
    try {
      let { page, take } = data;

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

      // Determine if the request is for a single group chat or a user-specific group chat
      if (data.groupId) {
        const group = await getGroupChat(data.groupId, page, take, data.userId);
        // Emit the created group chat data back to the client
        socket.broadcast.emit('groupChat', {
          data: group,
          message: `GroupChat with id ${data.groupId} has been retrieved`,
          status: true,
        });
      } else {
        const group = await getAllGroup(page, take, data.userId);
        // Emit the created group chat data back to the client
        socket.broadcast.emit('groupChat', {
          data: group,
          message:
            'Your Group Chat with also the latest chat has been retrieved',
          status: true,
        });
      }
    } catch (err) {
      socket.emit('groupChatCreationError', { message: err.message });
    }
  });

  socket.on('createChatByGroup', isAuthenticated, async (data) => {
    try {
      const { question, userId, groupId } = data;

      if (!question || !groupId) {
        throw new Error('You must provide a complete attribute');
      }

      const requestData = {
        userUtterance: question,
      };
      const mlEndpoint = 'https://appml-h7wjymk3wa-uc.a.run.app/predict';
      const mlResponse = await axios.post(mlEndpoint, requestData);
      // eslint-disable-next-line operator-linebreak, object-curly-newline
      const { altIntent1, altIntent2, chatType, predictedResponse } =
        mlResponse.data;

      const chat = await createChatbyGroup(
        question,
        predictedResponse,
        chatType,
        groupId,
        userId,
      );

      // Emit the created chat data back to the client
      socket.broadcast.emit('chatCreated', {
        data: chat,
        altIntent1,
        altIntent2,
        status: true,
      });
    } catch (err) {
      socket.emit('chatCreationError', { message: err.message });
    }
  });
  socket.on('bookmarkChat', isAuthenticated, async (data) => {
    try {
      const { chatId } = data;
      const isBookmarked = await checkIfUserAlreadyBookmarkedAChat(chatId);

      if (isBookmarked === null) {
        const bookmarkedChat = await bookmarkChat(chatId);
        socket.emit('bookmarkedChat', {
          data: bookmarkedChat,
          message: `Chat with id ${chatId} has been bookmarked`,
          status: true,
        });
      } else {
        const unbookmarkedChat = await unbookmarkChat(chatId);
        socket.emit('unbookmarkedChat', {
          data: unbookmarkedChat,
          message: `Chat with id ${chatId} has been unbookmarked`,
          status: true,
        });
      }
    } catch (err) {
      socket.emit('bookmarkingError', { message: err.message });
    }
  });

  socket.on('deleteChat', isAuthenticated, async (data) => {
    try {
      const { chatId } = data;
      const chatDel = await deleteChat(chatId);
      socket.emit('deletedChat', {
        data: chatDel,
        message: `Chat with id ${chatId} has been deleted`,
        status: true,
      });
    } catch (err) {
      socket.emit('deletingError', { message: err.message });
    }
  });

  socket.on('deleteGroupChat', isAuthenticated, async (data) => {
    try {
      const { groupId } = data;
      await deleteGroupChat(groupId);
      socket.emit('deletedGroupChat', {
        message: `Group Chat with id ${groupId} has been deleted`,
        status: true,
      });
    } catch (err) {
      socket.emit('deletingError', { message: err.message });
    }
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = router;

// const router = express.Router();
// //get GroupChatbyId
// router.get('/group/:groupId', isAuthenticated, async (req, res, next) => {
//   try {
//     const groupId = parseInt(req.params.groupId, 10);
//     let { page, take } = req.query;
//     if (!page) {
//       page = 1;
//     } else {
//       page = parseInt(page, 10);
//     }
//     if (!take) {
//       take = 5;
//     } else {
//       take = parseInt(take, 10);
//     }
//     const group = await getGroupChat(groupId, page, take);
//     res.status(200).json({
//       data: group,
//       message: `GroupChat with id ${groupId} has been retrieved`,
//       status: true,
//     });
//   } catch (err) {
//     next(err);
//   }
// });
// get all group
// router.get('/', isAuthenticated, async (req, res, next) => {
//   try {
//     const { userId } = req;
//     let { page, take } = req.query;
//     if (!page) {
//       page = 1;
//     } else {
//       page = parseInt(page, 10);
//     }
//     if (!take) {
//       take = 5;
//     } else {
//       take = parseInt(take, 10);
//     }
//     const group = await getAllGroup(page, take, userId);

//     res.status(200).json({
//       data: group,
//       message: 'Your Group Chat with also the latest chat has been retrieved',
//       status: true,
//     });
//   } catch (err) {
//     next(err);
//   }
// });

// create groupchat
// router.post('/group', isAuthenticated, async (req, res, next) => {
//   try {
//     const { userId } = req;
//     const group = await createGroupChat(userId);

//     res.status(201).json({
//       data: group,
//       message: 'New Group Chat has been created',
//       status: true,
//     });
//   } catch (err) {
//     next(err);
//   }
// });
// create chat by groupId
// router.post('/:groupId', isAuthenticated, async (req, res, next) => {
//   try {
//     const { question } = req.body;
//     const { userId } = req;
//     const groupId = parseInt(req.params.groupId, 10);

//     if (!question || !groupId) {
//       res.status(400);
//       throw new Error('You must provide a complete attribute');
//     }

//     const requestData = {
//       userUtterance: question,
//     };
//     const mlEndpoint = 'https://appml-h7wjymk3wa-uc.a.run.app/predict';
//     const mlResponse = await axios.post(mlEndpoint, requestData);
//     const { altIntent1, altIntent2, chatType, predictedResponse } =
//       mlResponse.data;

//     const chat = await createChatbyGroup(
//       question,
//       predictedResponse,
//       chatType,
//       groupId,
//       userId,
//     );

//     res.status(201).json({
//       data: {
//         chat,
//         altIntent1,
//         altIntent2,
//       },
//       message: 'New Chat has been created',
//       status: true,
//     });
//   } catch (err) {
//     next(err);
//   }
// });
// // bookmark single chat
// router.patch('/:chatId', isAuthenticated, async (req, res, next) => {
//   try {
//     const chatId = parseInt(req.params.chatId, 10);
//     const isBookmarked = await checkIfUserAlreadyBookmarkedAChat(chatId);
//     if (isBookmarked === null) {
//       console.log(chatId);
//       const bookmarkedChat = await bookmarkChat(chatId);
//       res.status(201).json({
//         data: bookmarkedChat,
//         message: `Chat with id ${chatId} has been bookmarked`,
//         status: true,
//       });
//     } else {
//       const unbookmarkedChat = await unbookmarkChat(chatId);
//       res.status(201).json({
//         data: unbookmarkedChat,
//         message: `Chat with id ${chatId} has been unbookmarked`,
//         status: true,
//       });
//     }
//   } catch (err) {
//     next(err);
//   }
// });

// // delete single chat
// router.delete('/:chatId', isAuthenticated, async (req, res, next) => {
//   try {
//     const chatId = parseInt(req.params.chatId, 10);

//     const chatDel = await deleteChat(chatId);
//     res.status(201).json({
//       data: chatDel,
//       message: `Chat with id ${chatId} has been deleted`,
//       status: true,
//     });
//   } catch (err) {
//     next(err);
//   }
// });
// // delete group chat
// router.delete('/group/:groupId', isAuthenticated, async (req, res, next) => {
//   try {
//     const groupId = parseInt(req.params.groupId, 10);

//     await deleteGroupChat(groupId);
//     res.status(201).json({
//       message: `Group Chat with id ${groupId} has been deleted`,
//       status: true,
//     });
//   } catch (err) {
//     next(err);
//   }
// });
// module.exports = router;
