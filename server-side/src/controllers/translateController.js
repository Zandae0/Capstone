const express = require('express');
const router = express.Router();
const multer = require('multer');
const storageService = require('../services/storageService');
const videoProcessing = require('../services/videoProcessing');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('video'), async (req, res, next) => {
  try {
    const filePath = req.file.path;
    const destFileName = `videos/${req.file.originalname}`;

    await storageService.uploadFile(filePath, destFileName);

    const videoPath = `videos/${req.file.originalname}`;
    const transcript = await videoProcessing.processVideo(videoPath);

    // Format the response as JSON array of letters
    const letters = transcript.split(',').map(letter => letter.trim());
    res.status(200).json({ success: letters });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
