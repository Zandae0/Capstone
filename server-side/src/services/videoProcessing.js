const fs = require('fs').promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { createCanvas, loadImage } = require('canvas');
const tf = require('@tensorflow/tfjs-node');

let model;

const loadModel = async () => {
  if (!model) {
    const modelPath = path.join(__dirname, 'model');
    model = await tf.loadGraphModel(process.env.MODEL_URL);
  }
  return model;
};

const extractFrames = async (videoPath, outputDir) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('end', () => {
        console.log(`Frames extracted to: ${outputDir}`);
        resolve();
      })
      .on('error', (error) => {
        console.error('Error extracting frames:', error.message);
        reject(error);
      })
      .save(`${outputDir}/frame%04d.png`);
  });
};

const processFrame = async (framePath) => {
  const image = await loadImage(framePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, image.width, image.height);

  const input = tf.browser.fromPixels(canvas);
  const prediction = model.predict(input.expandDims(0));

  const predictedClassIndex = prediction.argMax(1).dataSync()[0];
  const predictedLetter = String.fromCharCode(65 + predictedClassIndex); // 'A' is ASCII 65
  
  return predictedLetter;
};

exports.processVideo = async (videoPath) => {
  const model = await loadModel();
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

  return transcripts.join(' ');
};
