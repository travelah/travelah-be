require('dotenv').config();

const PORT = process.env.PORT || 5000;
const express = require('express');

// const usersRoutes = require('../routes/users');

const middlewareLogRequest = require('../middleware/logs');
const upload = require('../middleware/multer');
const auth = require('./auth/auth.routes');

const app = express();

const router = express();

app.use(middlewareLogRequest);
app.use(express.json());

// contoh get image
app.use('/assets', express.static('public/images'));
app.post('/upload', upload.single('photo'), (req, res) => {
  res.json({
    message: 'Upload Berhasil',
  });
});
app.use((err, req, res, next) => {
  res.json({
    message: err.message,
  });
});

// app.use('/users', usersRoutes);

app.listen(PORT, () => {
  console.log(`server berhasil di running di port ${PORT}`);
});

router.use('/auth', auth);
