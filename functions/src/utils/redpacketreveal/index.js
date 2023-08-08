const path = require("path");
const fs = require("fs");
const express = require("express");
const sharp = require("sharp");

const router = express.Router();

// POST endpoint to process images
router.post("/", async (req, res) => {
  try {
    const { buffer } = req.files[0];

    const overlayImageBuffer = fs.readFileSync(path.join(__dirname, "overlay.webp"));

    // Get the dimensions of the base image (PNG)
    const baseImageMetadata = await sharp(buffer).metadata();
    const baseImageWidth = baseImageMetadata.width;
    const baseImageHeight = baseImageMetadata.height;


    // Overlay the animated WebP on the PNG image
    const resizedBaseImage = await sharp(buffer, { animated: true })
        .resize(baseImageWidth, baseImageHeight)
        .gif()
        .toBuffer();

    // Resize the overlay image to match the dimensions of the base image
    const resizedOverlayImage = await sharp(overlayImageBuffer, { animated: true })
        .resize(baseImageWidth, baseImageHeight)
        .webp( { quality: 90 } )
        .toBuffer();

    const output = await sharp(resizedOverlayImage, { animated: true })
        .composite([
          { input: resizedBaseImage, left: 0, top: 0, tile: true, animated: true },
          { input: resizedOverlayImage, tile: true, animated: true },
        ])
        .withMetadata()
        .gif()
        .toBuffer();

    // Send the processed image in the response
    res.writeHead(200, {
      "Content-Type": "image/gif", // Change to the appropriate content type (e.g., image/png, image/jpeg) if needed
      "Content-Length": output.length,
    });

    res.end(output);
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Failed to process the image." });
  }
});

module.exports = router;
