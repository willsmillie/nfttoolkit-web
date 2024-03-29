const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const fileParser = require("express-multipart-file-parser");
const redpacketreveal = require("./utils/redpacketreveal");
const { authenticate: authenticateAndPersistApiKey } = require("./utils/loopring/api");
require("dotenv").config();

// Create an express app for the API
const app = express();

// Enable CORS for all routes
app.use(cors());

// Import your API routes
const api = require("./api");

// Call the authenticate function during server startup
authenticateAndPersistApiKey()
    .then(() => {
      console.log("Authenticated against Loopring SDK");
    })
    .catch((error) => {
      console.error("Error during authentication:", error);
      process.exit(1);
    });

// Mount the API routes
app.use("/", api);

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);


// Create an express app for the API
const imageProcessor = express();
// Enable CORS for all routes
imageProcessor.use(cors());
imageProcessor.use(fileParser);
imageProcessor.use("/", redpacketreveal);

exports.redpacketreveal = functions.runWith({timeoutSeconds: 300}).https.onRequest(imageProcessor);

