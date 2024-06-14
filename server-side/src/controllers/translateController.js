const express = require('express');
const router = express.Router();
const multer = require('multer');
const videoProcessing = require('../services/videoProcessing');

// Konfigurasi Multer untuk menyimpan file ke direktori 'uploads'
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('video'), async (req, res, next) => {
  try {
    const filePath = req.file.path;

    // Proses video dan dapatkan hasil transkripsi
    const transcript = await videoProcessing.processVideo(filePath);

    // Kirim respons JSON dengan hasil transkripsi
    res.status(200).json({ success: transcript });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
