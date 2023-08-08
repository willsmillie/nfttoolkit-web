const { URLSearchParams } = require("url");
const fetch = require("node-fetch");
const ethAddressRegex = require("./eth-ens-address-regex");
// Add  Reddit script credentials here
const {
  REDDIT_API_KEY,
  REDDIT_API_SECRET,
  REDDIT_USERNAME,
  REDDIT_PASSWORD,
} = process.env;

// gets comments & filters for ens & addresses ETH wallets
const getAddresses = async (postId) => {
  const comments = await getAllComments(postId);
  const thread = Object.values(comments);

  const allAddresses = thread.reduce((addresses, comment) => {
    const body = comment.body.replace(/(?:\r\n|\r|\n)/g, " ");
    const result = body.match(ethAddressRegex);

    if (result) {
      addresses.push(result[0]);
    }

    return addresses;
  }, []);

  return allAddresses;
};

// Retrieve all comments for a given postId from the reddit API
const getAllComments = async (postId) => {
  const token = await auth();

  const { comments, more } = await getPost(postId, token);

  while (more.length) {
    const current = more.shift();
    const selection = current.splice(0, 100); // NOTE: We can only query 100 at a time
    if (current.length) {
      more.push(current);
    }
    const { comments: moreComments, more: moreMore } = await getMoreChildren(
        `t3_${postId}`,
        selection.join(","),
        token,
    );
    comments.push(...moreComments);
    if (moreMore.length) {
      more.push(moreMore);
    }
  }

  return comments;
};

// Retrieve an auth token from reddit API
// / access token required for reddit api calls
const auth = async () => {
  const basicAuth = Buffer.from(`${REDDIT_API_KEY}:${REDDIT_API_SECRET}`).toString("base64");

  const params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("username", REDDIT_USERNAME);
  params.append("password", REDDIT_PASSWORD);

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
    body: params,
  });

  const body = await res.json();
  return body.access_token;
};

// Retrieve the Reddit Post via id
const getPost = async (postId, accessToken) => {
  const sort = "old";
  const threaded = false;

  const res = await fetch(`https://oauth.reddit.com/comments/${postId}?sort=${sort}&threaded=${threaded}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const body = await res.json();
  const comments = [];
  const more = [];

  body[1].data.children.forEach((child) => {
    extractComments(child, comments, more);
  });

  return { comments, more };
};

// extract the comments from a thread of comments
const extractComments = (child, comments, more) => {
  switch (child.kind) {
    case "t1":
      comments.push({
        body: child.data.body,
        author: child.data.author,
        id: child.data.id,
        parent_id: child.data.parent_id,
      });
      break;
    case "more":
      if (child.data.count > 0) {
        more.push(child.data.children);
      }
      break;
    default:
      break;
  }
};

// Retrieve child comments from the reddit API
const getMoreChildren = async (linkId, children, accessToken) => {
  const res = await fetch(
      `https://oauth.reddit.com/api/morechildren?link_id=${linkId}&children=${children}&api_type=json`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
  );

  const body = await res.json();
  const comments = [];
  const more = [];

  body.json.data.things.forEach((thing) => {
    extractComments(thing, comments, more);
  });

  return { comments, more };
};


module.exports = {
  getAddresses,
};
