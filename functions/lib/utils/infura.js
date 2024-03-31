import fetch from 'node-fetch';
import { RateLimit as ratelimit } from 'async-sema';
// configure a limit of maximum 5 requests / second
const limit = ratelimit(5);
// env vars
const { INFURA_IPFS_API_KEY, INFURA_IPFS_API_SECRET } = process.env;
// Basic auth for headers sent to Infura IPFS API
const auth = 'Basic ' + Buffer.from(INFURA_IPFS_API_KEY + ':' + INFURA_IPFS_API_SECRET).toString('base64');
const getMetadataForCID = async (cid) => {
    await limit();
    // url containing the cid
    const url = `https://ipfs.infura.io:5001/api/v0/dag/get?arg=${cid}&encoding=json`;
    // Post request to the infura ipfs API
    const headers = { 'Content-Type': 'application/json', 'Authorization': auth, 'RequestMode': 'no-cors' };
    const request = fetch(url, { method: 'POST', headers: headers, redirect: 'follow' });
    const response = await request.then((res) => res.json()).catch(console.error);
    // pretty printed mapping of the results
    // const infos = (response["Links"] ?? []).map((e) => `${e.Name} => ${e.Hash["/"]}`);
    return response;
};
export { getMetadataForCID };
//# sourceMappingURL=infura.js.map