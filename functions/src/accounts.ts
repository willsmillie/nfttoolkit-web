import * as functions from "firebase-functions";
import {accounts} from "./utils/firebase.js";
import {indexAccount} from "./runner/tasks.js";
import stringToArray from "./utils/stringToArray.js";

import cors from "cors";
const corsHandler = cors({origin: true});

// get the cached metadata of an ens list
const get = functions.https.onRequest(async (req, res) => {
  return await corsHandler(req, res, async () => {
    res.set("Access-Control-Allow-Origin", "*");
    const account = req.query.account ?? req.body.account ?? "fenneckit.eth";

    // array containing 0x and .eth address
    const mixedAddresses = stringToArray(account);

    // 0x addresses to return
    const results = [];

    // get it from the db
    await accounts
        .where(
            "ens",
            "in",
            mixedAddresses.filter((e) => e.endsWith(".eth"))
        )
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            results.push(doc.data());
          });
        })
        .catch((err) => console.error(err.message));

    // accounts to be indexed
    const missingAccounts = mixedAddresses
        .filter((addressOrEns) => !results.find((i) => i.ens === addressOrEns || i.address === addressOrEns))
        .filter((e) => e.endsWith(".eth"));

    // index the missing accounts
    if (missingAccounts.length > 0) {
      for (const i in missingAccounts) {
        const mixedAddress = missingAccounts[i];
        if (mixedAddress) indexAccount(mixedAddress);
      }
    } else {
      return res.send(results.map((e) => e.address));
    }

    return res.send({status: "indexing"});
  });
});

export default {
  get,
};
