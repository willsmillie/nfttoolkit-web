import {TwitterApi} from 'twitter-api-v2';
// configure a limit of maximum 5 requests / second
import {RateLimit as ratelimit} from 'async-sema';
const limit = ratelimit(5);

import ethExp from './eth-ens-address-regex.js';

const {TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET} = process.env;

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
export const getAddresses = async (tweetId) => {
  return await loadTweets(tweetId).then((replies) => {
    const allAddresses = [];

    for (const reply of replies) {
      const result = reply.match(ethExp);
      if (result) {
        allAddresses.push(result[0]);
      }
    }

    return allAddresses;
  });
};

// load tweets from the timeline
const loadTweets = async (tweetId) => {
  // make the request
  const response = await twitter.v2.search(`conversation_id:${tweetId}`, {
    'user.fields': ['name', 'username'],
    'tweet.fields': ['author_id', 'conversation_id', 'created_at', 'in_reply_to_user_id', 'referenced_tweets'],
  });

  // Load the entire thread
  while (!response.done) {
    await limit();
    await response.fetchNext();
  }

  const replies = [];
  for (const fetchedTweet of response) {
    replies.push(fetchedTweet.text.replace(/(\r\n|\n|\r)/gm, ' '));
  }
  return replies;
};
