const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Inisialisasi Storage client dengan kunci JSON langsung
const storage = new Storage({
  projectId: 'Captone-Proyek-C241-PS507', // Ganti dengan ID proyek Anda
  keyFilename: path.join(__dirname, '../config/captone-proyek-c241-ps507-5a29f990ade2.json') // Ganti dengan path ke file JSON Anda
});

const bucketName = 'translasign_video'; // Ganti dengan nama bucket Anda
const bucket = storage.bucket(bucketName);

const uploadFile = async (filePath, destFileName) => {
  try {
    console.log(`Uploading file: ${filePath} to bucket: ${bucketName}/${destFileName}`);
    await bucket.upload(filePath, {
      destination: destFileName,
    });
    console.log(`File uploaded successfully: ${filePath} to bucket: ${bucketName}/${destFileName}`);
  } catch (error) {
    console.error('Error uploading file:', error.message, error.code, error.errors);
    throw new Error('Failed to upload file');
  }
};

module.exports = { uploadFile };
