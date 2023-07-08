const express = require("express");
const router = express.Router();
const stringToArray = require('../../utils/stringToArray');

// Thread ripper clients
const Reddit = require('./reddit');
const Twitter = require('./twitter');

// Regular expressions
const redditRegex = /(^https?:\/\/)?(\w+).?(reddit\.com\/|redd\.it)(r\/\w+\/)?(comments\/)?(\w+)/gm;
const isRedditThread = (url) => url.match(redditRegex);
const redditPostId = (url) => getMatches(url, redditRegex, 6);

const twitterRegex = /(^https?:\/\/)?(\w+.)?(twitter\.com\/)(\w+\/)?(status\/)?(\w+)/gm;
const isTwitterThread = (url) => url.match(twitterRegex);
const twitterStatusId = (url) => getMatches(url, twitterRegex, 6);

function getMatches(string, regex, index) {
  const matches = [];
  let match;
  do {
    match = regex.exec(string);
    if (match) {
      matches.push(match[index ?? 1]);
    }
  } while (match);

  return matches[0] ?? null;
}

// Create the thread ripper endpoint
module.exports = async (req, res) => {
  try {
    const { urls } = req.query;
    let urlsArray = stringToArray(urls);
    console.log(urlsArray)

    const requests = urlsArray.map((url) => {
      if (isRedditThread(url)) {
        return Reddit.getAddresses(redditPostId(url));
      } else if (isTwitterThread(url)) {
        return Twitter.getAddresses(twitterStatusId(url));
      } else {
        console.log('UNSUPPORTED', url);
        return Promise.resolve([]);
      }
    });

    const results = await Promise.all(requests);
    res.send(results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
