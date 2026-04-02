const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
const sourceImage = path.join(assetsDir, 'Gemini_Generated_Image_us1awuus1awuus1a.png');

if (!fs.existsSync(sourceImage)) {
  console.error("Source image not found!");
  process.exit(1);
}

// Old files to delete
const oldFiles = [
  'android-icon-background.png',
  'android-icon-foreground.png',
  'android-icon-monochrome.png',
  'icon.png',
  'splash-icon.png',
  'favicon.png'
];

oldFiles.forEach(file => {
  const filePath = path.join(assetsDir, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted ${file}`);
  }
});

// New targets
const targets = ['icon.png', 'splash-icon.png', 'favicon.png'];

targets.forEach(target => {
  fs.copyFileSync(sourceImage, path.join(assetsDir, target));
  console.log(`Copied new image to ${target}`);
});

console.log("Assets replacement complete!");
