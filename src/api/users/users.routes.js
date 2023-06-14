const express = require('express');
const { isAuthenticated } = require('../../middleware/middleware');
const { findUserById, updateProfile } = require('./users.services');

const router = express.Router();
const { upload, uploadToStorage } = require('../../middleware/multer');

router.get('/profile', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req.payload;
    const user = await findUserById(userId);
    delete user.password;
    res.status(200).json({
      data: user,
      message: 'Success retrieve your profile',
      status: true,
    });
  } catch (err) {
    next(err);
  }
});

router.put(
  '/profile',
  isAuthenticated,
  upload.single('photo'),
  async (req, res, next) => {
    try {
      const { userId } = req.payload;
      const user = await findUserById(userId);
      if (!user) {
        res.status(400);
        throw new Error('User not found');
      }

      const updatedProfile = { ...user }; // Start with the existing user profile

      const {
        aboutMe, age, occupation, location, fullName,
      } = req.body;

      if (aboutMe) {
        updatedProfile.aboutMe = aboutMe;
      }
      if (age) {
        updatedProfile.age = parseInt(age, 10);
      }
      if (occupation) {
        updatedProfile.occupation = occupation;
      }
      if (location) {
        updatedProfile.location = location;
      }
      if (fullName) {
        updatedProfile.fullName = fullName;
      }
      if (req.file != null) {
        const timestamp = new Date().getTime();
        const photo = req.file;
        if (!photo) {
          res.status(400).json({ error: 'No photo provided' });
          return;
        }

        const destinationPath = 'public/images';
        await uploadToStorage(photo, destinationPath, timestamp);
        const updatedUser = await updateProfile(
          updatedProfile,
          userId,
          destinationPath,
          `${timestamp}-${photo.originalname}`,
        );
        res.status(200).json({
          data: updatedUser,
          message: 'Profile updated successfully',
          status: true,
        });
      } else {
        const updatedUser = await updateProfile(
          updatedProfile,
          userId,
        );
        res.status(200).json({
          data: updatedUser,
          message: 'Profile updated successfully',
          status: true,
        });
      }
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
