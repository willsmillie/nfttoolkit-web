const path = require("path");
const fs = require("fs");
const express = require("express");
const sharp = require("sharp");

sharp.cache({ items: 2 });
sharp.concurrency(2);

const router = express.Router();

// POST endpoint to process images
router.post("/", async (req, res) => {
  try {
    const { buffer } = req.files[0];
    const tempOverlayPath = path.join("/tmp", "overlay.webp");
    fs.writeFileSync(tempOverlayPath, fs.readFileSync(path.join(__dirname, "overlay.webp")));

    const baseImageMetadata = await sharp(buffer).metadata();
    const baseImageWidth = baseImageMetadata.width;
    const baseImageHeight = baseImageMetadata.height;

    const tempBaseImagePath = path.join("/tmp", "baseImage.gif");
    const tempOverlayImagePath = path.join("/tmp", "overlayImage.webp");

    console.log("resizing...");
    await Promise.all([
      sharp(buffer, { animated: true, failOn: "truncated" } )
          .resize(baseImageWidth, baseImageHeight)
          .gif()
          .toFile(tempBaseImagePath),

      sharp(tempOverlayPath, { animated: true })
          .resize(baseImageWidth, baseImageHeight)
          .webp({ quality: 90 })
          .toFile(tempOverlayImagePath),
    ]);

    const outputImagePath = path.join("/tmp", "output.gif");

    console.log("compositing...");
    await sharp(tempOverlayImagePath, { animated: true, limitInputPixels: false })
        .composite([
          { input: tempBaseImagePath, left: 0, top: 0, tile: true, animated: true, limitInputPixels: false},
          { input: tempOverlayImagePath, tile: true, animated: true, limitInputPixels: false },
        ])
        .withMetadata()
        .gif()
        .toFile(outputImagePath);

    // Send the processed image in the response
    const outputBuffer = fs.readFileSync(outputImagePath);
    res.writeHead(200, {
      "Content-Type": "image/gif",
      "Content-Length": outputBuffer.length,
    });

    res.end(outputBuffer);

    // Clean up temporary files
    fs.unlinkSync(tempOverlayPath);
    fs.unlinkSync(tempBaseImagePath);
    fs.unlinkSync(tempOverlayImagePath);
    fs.unlinkSync(outputImagePath);
  } catch (error) {
    console.error("Error processing image:", error.message);
    res.status(500).json({ error: "Failed to process the image.", message: error.message ?? error });
  }
});

module.exports = router;
