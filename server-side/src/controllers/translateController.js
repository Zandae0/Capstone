const express = require('express');
const multer = require('multer');
const videoProcessing = require('../services/videoProcessing');

const router = express.Router();
const upload = multer();

router.post('/', upload.single('video'), async (req, res, next) => {
  try {
    const videoBuffer = req.file.buffer;

    // Proses video dan dapatkan hasil transkripsi
    const transcript = await videoProcessing.processVideo(videoBuffer);

    // Kirim respons JSON dengan hasil transkripsi
    res.status(200).json({ success: transcript });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
