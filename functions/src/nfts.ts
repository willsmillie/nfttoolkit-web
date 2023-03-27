import * as functions from "firebase-functions";
import {nfts} from "./utils/firebase.js";
import {indexNFT} from "./runner/tasks.js";
import {getBalances, getHoldersForNFTData} from "./utils/web3.js";
import cors from "cors";
const corsHandler = cors({origin: true});

// LISTING All INDEXED NFTS
const list = functions.https.onRequest(async (req, res) => {
  const results = [];

  nfts
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          results.push(doc.data());
        });
        return res.send(results);
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
});

// List NFTs held by an L2 accountId
const ownedBy = functions
    .runWith({
      timeoutSeconds: 300,
      memory: "1GB",
    })
    .https.onRequest(async (req: any, res: any) => {
      const account = req.query.account ?? req.body.account;
      // Get balance of account from loopring
      const {userNFTBalances} = await getBalances(account);
      // userNFTBalances.forEach((token) => indexNFT(token));
      res.set("Access-Control-Allow-Origin", "*");
      return res.send(userNFTBalances);
    });

// get the cached metadata of an nft
const get = functions.https.onRequest(async (req, res) => {
  return await corsHandler(req, res, async () => {
    const nftId =
      req.query.nftId ?? req.body.nftId ?? "0x8a1967f5f93da038ad570a5244879031d010b8efa5c95eadcdf7df0f8cfbd25c";

    // get it from the db
    const result = await nfts
        .doc(nftId)
        .get()
        .then((res) => res.data())
        .catch((err) => console.error(err.message));

    res.set("Access-Control-Allow-Origin", "*");
    if (result) return res.send(result);

    const ref = await indexNFT({nftId});
    return res.send({status: "indexing", ref});
  });
});

// get the cached holders of an nft
const getHolders = functions.https.onRequest(async (req, res) => {
  return await corsHandler(req, res, async () => {
    const nftData =
      req.query.nftData ?? req.body.nftData ?? "0x8a1967f5f93da038ad570a5244879031d010b8efa5c95eadcdf7df0f8cfbd25c";

    const result = await getHoldersForNFTData(nftData);
    // get it from the db
    // const result = await nfts
    //   .doc(nftId)
    //   .get()
    //   .then((res) => res.data())
    //   .catch((err) => console.error(err.message));

    res.set("Access-Control-Allow-Origin", "*");
    return res.send(result);

    // const ref = await indexNFT({ nftId });
    // return res.send({ status: 'indexing', ref });
  });
});

export default {
  list,
  ownedBy,
  get,
  getHolders,
};
