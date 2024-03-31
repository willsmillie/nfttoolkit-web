import * as functions from 'firebase-functions';
import stringToArray from './utils/stringToArray.js';
// Thread ripper clients
import * as Reddit from './utils/reddit.js';
import * as Twitter from './utils/twitter.js';
import cors from 'cors';
const corsHandler = cors({ origin: true });
// Regular expressions
// / https://regex101.com/r/5qiW39/1
const redditRegex = /(^https?:\/\/)?(\w+).?(reddit\.com\/|redd\.it)(r\/\w+\/)?(comments\/)?(\w+)/gm;
const isRedditThread = (url) => url.match(redditRegex);
const redditPostId = (url) => getMatches(url, redditRegex, 6); // 6 is the index of the thread
// / https://regex101.com/r/wPEo7T/1
const twitterRegex = /(^https?:\/\/)?(\w+.)?(twitter\.com\/)(\w+\/)?(status\/)?(\w+)/gm;
const isTwitterThread = (url) => url.match(twitterRegex);
const twitterStatusId = (url) => getMatches(url, twitterRegex, 6); // 6 is also the index of the thread on this one
// Helper to get the index of a regex match
function getMatches(string, regex, index) {
    index || (index = 1); // default to the first capturing group
    const matches = [];
    let match;
    while ((match = regex.exec(string))) {
        matches.push(match[index]);
    }
    return matches[0] ?? null;
}
// get the cached metadata of an ens list
const get = functions.https.onRequest(async (req, res) => {
    return await corsHandler(req, res, async () => {
        const postUrls = req.query.url ?? req.body.url ?? 'fenneckit.eth';
        // array containing urls to parse, bc why not
        const urls = stringToArray(postUrls);
        // an array containing the requests
        const requests = [];
        // loop thru the urls preparing the requests
        urls.forEach((url) => {
            if (isRedditThread(url)) {
                requests.push(Reddit.getAddresses(redditPostId(url)));
            }
            else if (isTwitterThread(url)) {
                requests.push(Twitter.getAddresses(twitterStatusId(url)));
            }
            else {
                console.log('UNSUPPORTED', url);
            }
        });
        // results of the 0x addresses scraped from the provided urls
        const results = await Promise.all(requests);
        return res.set('Access-Control-Allow-Origin', '*').send(results.map((e) => e.flat(10)));
    });
});
export default {
    get,
};
//# sourceMappingURL=thread-ripper.js.map