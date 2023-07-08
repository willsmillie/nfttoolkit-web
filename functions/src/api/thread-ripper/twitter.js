const { TwitterApi } = require("twitter-api-v2");
const ethExp = require("./eth-ens-address-regex");

const {
  TWITTER_API_KEY,
  TWITTER_API_SECRET,
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET,
} = process.env;

// auth methods
const auth = () => {
  const secret = {
    appKey: TWITTER_API_KEY,
    appSecret: TWITTER_API_SECRET,
    accessToken: TWITTER_ACCESS_TOKEN,
    accessSecret: TWITTER_ACCESS_TOKEN_SECRET,
  };

  const client = new TwitterApi(secret);
  const rwClient = client.readWrite;
  return rwClient;
};

// create an instance of the twitter API client
const twitter = auth();

// parse each reply in search of a ETH / ENS address
const getAddresses = async (tweetId) => {
  const replies = await loadTweets(tweetId);
  const allAddresses = replies
      .map((reply) => reply.match(ethExp))
      .filter((result) => result !== null)
      .map((result) => result[0]);

  return allAddresses;
};

// load tweets from the timeline
const loadTweets = async (tweetId) => {
  const response = await twitter.v2.search(`conversation_id:${tweetId}`, {
    "user.fields": ["name", "username"],
    "tweet.fields": ["author_id", "conversation_id", "created_at", "in_reply_to_user_id", "referenced_tweets"],
  });

  await response.autoPaginate(); // Load the entire thread

  const replies = response.data.map((fetchedTweet) => fetchedTweet.text.replace(/(\r\n|\n|\r)/gm, " "));
  return replies;
};


module.exports = {
  getAddresses,
};
