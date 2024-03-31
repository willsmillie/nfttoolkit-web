import * as functions from 'firebase-functions';
import { getGatedContent } from './model/gated-content.js';
import cors from 'cors';
const corsHandler = cors({ origin: true });
// get the cached metadata of an nft
const get = functions.https.onRequest(async (req, res) => {
    return await corsHandler(req, res, async () => {
        const nftId = req.query.nftId ?? req.body.nftId ?? '0x8a1967f5f93da038ad570a5244879031d010b8efa5c95eadcdf7df0f8cfbd25c';
        // get it from the db or external service
        const result = await getGatedContent(nftId);
        return res.set('Access-Control-Allow-Origin', '*').send(result);
    });
});
export default { get };
//# sourceMappingURL=gated-content.js.map