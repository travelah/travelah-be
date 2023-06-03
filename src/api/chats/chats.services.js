const { db } = require('../../utils/db');
// function
function getChat(chatId) {
  return db.chat.findUnique({
    where: {
      id: chatId,
    },
  });
}
function getGroupChat(groupId, page, take) {
  const skip = take * (page - 1); // Calculate the skip value based on page number
  return db.groupChat.findMany({
    where: {
      id: groupId,
    },
    include: {
      chats: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    skip,
    take,
    orderBy: {
      id: 'desc',
    },
  });
}
async function getAllGroup(page, take, userId) {
  return db.groupChat.findMany({
    skip: take * (page - 1),
    take,
    include: {
      chats: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
    orderBy: {
      id: 'desc',
    },
    where: {
      userId,
    },
  });
}

function createGroupChat(userId) {
  return db.groupChat.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
    },
    select: {
      id: true,
    },
  });
}
function createChatbyGroup(question, response, type, groupId, userId) {
  return db.chat.create({
    data: {
      question,
      response,
      type,
      groupChat: {
        connect: {
          id: groupId,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
      bookmarked: false,
    },
  });
}
function checkIfUserAlreadyBookmarkedAChat(chatId) {
  return db.chat.findFirst({
    where: {
      id: chatId,
      bookmarked: true,
    },
  });
}
function bookmarkChat(chatId) {
  return db.chat.update({
    where: {
      id: chatId,
    },
    data: {
      bookmarked: true,
    },
  });
}

function unbookmarkChat(chatId) {
  return db.chat.update({
    where: {
      id: chatId,
    },
    data: {
      bookmarked: false,
    },
  });
}

function deleteChat(chatId) {
  return db.chat.delete({
    where: {
      id: chatId,
    },
  });
}
async function deleteGroupChat(groupId) {
  return db.$transaction(async (prisma) => {
    await prisma.chat.deleteMany({
      where: {
        groupChatId: groupId,
      },
    });

    await prisma.groupChat.delete({
      where: {
        id: groupId,
      },
    });
  });
}
module.exports = {
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
};
