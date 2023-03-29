import * as functions from "firebase-functions";
import stringToArray from "./utils/stringToArray.js";
import {getAccountsByAddresses} from "./model/account.js";

import cors from "cors";
const corsHandler = cors({origin: true});

// get the cached metadata of an ens list
const get = functions.https.onRequest(async (req, res) => {
  return await corsHandler(req, res, async () => {
    res.set("Access-Control-Allow-Origin", "*");
    const account = req.query.account ?? req.body.account ?? "fenneckit.eth";

    // array containing 0x and .eth address
    const mixedAddresses = stringToArray(account);

    return await getAccountsByAddresses(mixedAddresses);
  });
});

export default {
  get,
};
