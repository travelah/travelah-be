const express = require('express');
const multer = require('multer');
const { isAuthenticated } = require('../../middleware/middleware');
const {
  findUserById,
  updateProfile,
  uploadProfilephoto,
} = require('./users.services');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
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
      let updatedProfile;
      let updatedProfilePhoto;
      delete user.password;
      if (req.file != null) {
        const photo = req.file;
        if (!photo) {
          res.status(400).json({ error: 'No photo provided' });
          return;
        }

        // Process the photo and save it to Google Cloud Storage
        const photoPath = photo.path;
        const destinationPath = `profile-photos/${photo.originalname}`;

        updatedProfilePhoto = await uploadProfilephoto(
          photoPath,
          destinationPath,
          userId,
          photo.originalname,
        );
        updatedProfile = await updateProfile(req.body, userId);

        res.status(200).json({
          data: updatedProfile,
          // updatedProfile,
          message: 'Success retrieve your profile',
          status: true,
        });
      } else {
        updatedProfile = await updateProfile(req.body, userId);
        res.status(200).json({
          data: updatedProfile,
          // updatedProfile,
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
