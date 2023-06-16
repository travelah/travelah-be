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
  const groups = await db.groupChat.findMany({
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
    where: {
      userId,
    },
  });

  // Sort the groups based on the most recent chat within each group
  const sortedGroups = groups.sort((a, b) => {
    const lastChatA = a.chats[0];
    const lastChatB = b.chats[0];

    if (lastChatA && lastChatB) {
      return new Date(lastChatB.createdAt) - new Date(lastChatA.createdAt);
    }
    if (lastChatA) {
      return -1;
    }
    if (lastChatB) {
      return 1;
    }

    return 0;
  });

  return sortedGroups;
}

async function getAllChatFromGroupChatWithPaging(groupId, page, take) {
  return db.chat.findMany({
    skip: take * (page - 1),
    take,
    orderBy: {
      id: 'asc',
    },
    where: {
      groupChatId: groupId,
    },
    include: {
      user: {
        select: {
          profilePicPath: true,
          profilePicName: true,
        },
      },
    },
  });
}

async function getAllChatFromGroupChat(groupId) {
  return db.chat.findMany({
    orderBy: {
      id: 'asc',
    },
    where: {
      groupChatId: groupId,
    },
    include: {
      user: {
        select: {
          profilePicPath: true,
          profilePicName: true,
        },
      },
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
function createChatbyGroup(
  question,
  predictedResponse,
  altIntent1,
  altIntent2,
  followUpQuestion,
  places,
  chatType,
  groupId,
  userId,
) {
  return db.chat.create({
    data: {
      question,
      response: predictedResponse,
      altIntent1,
      altIntent2,
      followUpQuestion,
      places,
      chatType,
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

async function deleteChat(chatId) {
  const chat = await db.chat.findUnique({
    where: {
      id: chatId,
    },
  });

  if (!chat) {
    throw new Error('Chat not found!');
  }
  return db.chat.delete({
    where: {
      id: chatId,
    },
  });
}
async function deleteGroupChat(groupId) {
  const group = await db.groupChat.findUnique({
    where: {
      id: groupId,
    },
  });

  if (!group) {
    throw new Error('Chat Group not found!');
  }
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
  getAllChatFromGroupChat,
  getAllChatFromGroupChatWithPaging,
};
