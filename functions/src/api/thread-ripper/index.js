const stringToArray = require("../../utils/stringToArray");

// Thread ripper clients
const Reddit = require("./reddit");
const Twitter = require("./twitter");

// Regular expressions
const redditRegex = /(^https?:\/\/)?(\w+).?(reddit\.com\/|redd\.it)(r\/\w+\/)?(comments\/)?(\w+)/gm;
const isRedditThread = (url) => url.match(redditRegex);
const redditPostId = (url) => getMatches(url, redditRegex, 6);

const twitterRegex = /(^https?:\/\/)?(\w+.)?(twitter\.com\/)(\w+\/)?(status\/)?(\w+)/gm;
const isTwitterThread = (url) => url.match(twitterRegex);
const twitterStatusId = (url) => getMatches(url, twitterRegex, 6);

/**
 * Retrieves all matches of a regular expression in a string.
 * @param {string} string - The input string to search for matches.
 * @param {RegExp} regex - The regular expression pattern to match against the string.
 * @param {number} [index=1] - The index of the match group to return. Defaults to 1.
 * @return {string|null} - The first match found, or null if no matches are found.
 */
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
    const urlsArray = stringToArray(urls);
    console.log(urlsArray);

    const requests = urlsArray.map((url) => {
      if (isRedditThread(url)) {
        return Reddit.getAddresses(redditPostId(url));
      } else if (isTwitterThread(url)) {
        return Twitter.getAddresses(twitterStatusId(url));
      } else {
        console.log("UNSUPPORTED", url);
        return Promise.resolve([]);
      }
    });

    const results = await Promise.all(requests);
    res.send(results);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
