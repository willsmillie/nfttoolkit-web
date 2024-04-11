/* eslint-disable require-jsdoc */
const express = require("express");
const jsmediatags = require("jsmediatags");

const router = express.Router();

/**
 * GET /api/ipfs/tags/:cid
 * Retrieves the file list for a specific gateId.
 * @param {string} cid - IPFS Cid of the target audio file
 * @returns {Object} - The id3 tags for the specified file cid.
 * @throws {Error} - If an error occurs while retrieving the file list.
 */
router.get("/tags/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const {tags} = await readMediaTagsFromIPFS(cid);
    const {title, album, artist, track, year} = tags;

    res.json({title, album, artist, track, year});
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ error: "An error occurred while parsing id3 tags" });
  }
});


function readMediaTagsFromIPFS(cid) {
  return new Promise((resolve, reject) => {
    jsmediatags.read(`http://ipfs.io/ipfs/${cid}`, {
      onSuccess(tag) {
        resolve(tag);
      },
      onError(error) {
        reject(error);
      },
    });
  });
}


