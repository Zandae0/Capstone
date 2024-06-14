const fs = require('fs').promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { createCanvas, loadImage } = require('canvas');
const tf = require('@tensorflow/tfjs-node');

let model;

const loadModel = async () => {
  if (!model) {
    model = await tf.loadLayersModel(process.env.MODEL_URL);
  }
  return model;
};

const extractFrames = async (videoPath, outputDir) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('end', resolve)
      .on('error', reject)
      .save(`${outputDir}/frame%04d.png`);
  });
};

const resizeImage = (image, width, height) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
};

const processFrame = async (framePath) => {
  const image = await loadImage(framePath);

  // Ubah ukuran gambar menjadi 224x224
  const resizedCanvas = resizeImage(image, 224, 224);

  const input = tf.browser.fromPixels(resizedCanvas);
  const prediction = model.predict(input.expandDims(0));

  // Get the predicted class index (0 to 25)
  const predictedClassIndex = prediction.argMax(1).dataSync()[0];
  
  // Map predicted class index to corresponding letter (A' is ASCII 65)
  const predictedLetter = String.fromCharCode(65 + predictedClassIndex); // 'A' is ASCII 65
  
  return predictedLetter;
};

exports.processVideo = async (videoPath) => {
  await loadModel();
  const outputDir = '/tmp/frames';

  await fs.mkdir(outputDir, { recursive: true });
  await extractFrames(videoPath, outputDir);

  const frames = await fs.readdir(outputDir);
  const transcripts = [];

  for (const frame of frames) {
    const framePath = path.join(outputDir, frame);
    const transcript = await processFrame(framePath);
    transcripts.push(transcript);
  }

  return transcripts.join('');
};
