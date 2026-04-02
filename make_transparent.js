const fs = require('fs');
const path = require('path');

// A 1x1 fully transparent PNG image
const transparentBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const targetPath = path.join(__dirname, 'assets', 'transparent.png');

fs.writeFileSync(targetPath, Buffer.from(transparentBase64, 'base64'));

console.log("transparent.png successfully generated in the assets folder!");
