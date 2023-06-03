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

router.post(
  '/profile',
  isAuthenticated,
  upload.single('photo'),
  async (req, res, next) => {
    try {
      const { userId } = req.payload;
      const user = await findUserById(userId);
      if (!user) {
        res.status(400);
        throw new Error('You are not found as a user');
      }
      let updatedProfile;

      if (req.file != null) {
        const timestamp = new Date().getTime();
        const photo = req.file;
        if (!photo) {
          res.status(400).json({ error: 'No photo provided' });
          return;
        }
        console.log('masuk pak');
        // Process the photo and save it to Google Cloud Storage
        const destinationPath = 'public/images'; // Specify the desired folder name
        console.log(req.body);
        await uploadToStorage(photo, destinationPath, timestamp);

        updatedProfile = await updateProfile(
          req.body,
          userId,
          destinationPath,
          `${timestamp}-${photo.originalname}`,
        );

        res.status(200).json({
          data: updatedProfile,
          message: 'Success retrieve your profile',
          status: true,
        });
      } else {
        updatedProfile = await updateProfile(req.body, userId);
        res.status(200).json({
          data: updatedProfile,
          message: 'Success retrieve your profile',
          status: true,
        });
      }
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
