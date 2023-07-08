const express = require("express");

const router = express.Router();
const accountAPI = require("./account");
const filesAPI = require("./files");
const threadRipper = require("./thread-ripper");

// Define the routes for the /api/ endpoint
router.get("/", (req, res) => res.send({ status: "nfttoolkit at ur service!" }));

// Define the routes for the /api/account endpoint
router.use("/account", accountAPI);

// Define the routes for the /api/files endpoint
router.use("/files", filesAPI);

// Define the routes for the /api/thread-ripper endpoint
router.use("/thread-ripper", threadRipper);

// Export the router
module.exports = router;
