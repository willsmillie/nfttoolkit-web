const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

router.get("/:url/*", async (req, res) => {
  const { url } = req.params;
  const additionalPath = req.params[0]; // Capture additional path segments

  const fullUrl = `${url}/${additionalPath}${req.url.slice(req.path.length)}`;

  try {
    // Perform the request to the specified URL
    const response = await fetch(fullUrl);

    // Extract the response body
    const data = await response.text();

    // Set the appropriate headers to allow CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    // Send the response body
    res.send(data);
  } catch (error) {
    console.log(error);
    // Handle any errors that occurred during the request
    res.status(500).send("Error occurred while making the request");
  }
});

module.exports = router;
