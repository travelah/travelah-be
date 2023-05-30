const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');

const {
  findUserByEmail,
  createUserByEmailAndPassword,
  findUserById,
  createUserOnlyByEmail,
} = require('../users/users.services');
const { generateTokens } = require('../../utils/jwt');
const {
  addRefreshTokenToWhitelist,
  findRefreshTokenById,
  deleteRefreshToken,
  revokeTokens,
} = require('./auth.services');
const { hashToken } = require('../../utils/hashToken');

const router = express.Router();

const serviceAccount = require('./ServiceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const auth = admin.auth();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('You must provide an email and a password.');
    }

    if (!fullName) {
      res.status(400);
      throw new Error('You must provide your full name.');
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      res.status(400);
      throw new Error('Email already in use.');
    }

    const user = await createUserByEmailAndPassword({
      email,
      password,
      fullName,
    });
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });

    res.status(201).json({
      data: {
        fullName,
      },
      message: 'Registration success',
      status: true,
    });
    // }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    let existingUser;
    let createdUser;

    if (req.body.signInByGoogle) {
      const decodedToken = await auth.verifyIdToken(req.body.googleAuthToken);
      const { email, name } = decodedToken;

      existingUser = await findUserByEmail(email);
      if (existingUser === null) {
        createdUser = await createUserOnlyByEmail({
          email,
          fullName: name,
          isSignedByGoogle: true,
        });
      }
    } else {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400);
        throw new Error('You must provide an email and a password.');
      }

      existingUser = await findUserByEmail(email);

      if (!existingUser) {
        res.status(403);
        throw new Error('Invalid login credentials.');
      }

      const validPassword = await bcrypt.compare(
        password,
        existingUser.password,
      );

      if (!validPassword) {
        res.status(403);
        throw new Error('Wrong password');
      }
    }

    const jti = uuidv4();

    if (existingUser || createdUser) {
      if (existingUser === null) {
        const { accessToken, refreshToken } = generateTokens(createdUser, jti);
        await addRefreshTokenToWhitelist({
          jti,
          refreshToken,
          userId: createdUser.id,
        });

        res.status(200).json({
          data: {
            token: accessToken,
          },
          message: 'Login succeed, enjoy your trip',
          status: true,
        });
      } else {
        const { accessToken, refreshToken } = generateTokens(existingUser, jti);
        await addRefreshTokenToWhitelist({
          jti,
          refreshToken,
          userId: existingUser.id,
        });

        res.status(200).json({
          data: {
            token: accessToken,
          },
          message: 'Login succeed, enjoy your trip',
          status: true,
        });
      }
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post('/refreshToken', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400);
      throw new Error('Missing refresh token.');
    }
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const savedRefreshToken = await findRefreshTokenById(payload.jti);

    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const hashedToken = hashToken(refreshToken);
    if (hashedToken !== savedRefreshToken.hashedToken) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const user = await findUserById(payload.userId);
    if (!user) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    await deleteRefreshToken(savedRefreshToken.id);
    const jti = uuidv4();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user,
      jti,
    );
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken: newRefreshToken,
      userId: user.id,
    });

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// This endpoint is only for demo purpose.
// Move this logic where you need to revoke the tokens( for ex, on password reset)
router.post('/revokeRefreshTokens', async (req, res, next) => {
  try {
    const { userId } = req.body;
    await revokeTokens(userId);
    res.json({ message: `Tokens revoked for user with id #${userId}` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
