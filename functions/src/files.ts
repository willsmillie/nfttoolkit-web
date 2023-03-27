import * as functions from "firebase-functions";
import {cids} from "./utils/firebase.js";
import {indexCID} from "./runner/tasks.js";
import cors from "cors";
const corsHandler = cors({origin: true});

const parseLinks = (data) => {
  if (!data || data?.Data == null) return null;
  // verify the document is using a file-structure encoding (instead of base64 or something)
  if (data?.Data["/"]?.bytes === "CAE") {
    return Object.keys(data.Links).map((key) => {
      const link = data.Links[key];
      return {id: link.Hash["/"], name: link.Name, size: link.Tsize};
    });
  }
  return null;
};

const getRecursiveLinks = async (data) => {
  const links = parseLinks(data);
  if (links == null || links?.length == 0) return null;

  const results = {};

  for (const key in links) {
    if (links[key] != null) {
      const link = links[key];
      results[link.id];

      // does this link have children?
      const children = await getOrEnqueueCID(link.id);

      // get link
      console.log(link.id, children);
      if (children) {
        results[link.id] = {...link, links: children};
      } else {
        results[link.id] = {...link};
      }
    }
  }
  // const results = await resolveLinks(links);
  return Object.keys(results).length == 0 ? null : Object.values(results);
};

const getOrEnqueueCID = async (cid) => {
  // attempt to fetch a cached version
  const data = await cids
      .doc(cid)
      .get()
      .then((res) => res.data())
      .catch((err) => console.warn(err));

  if (data) {
    return await getRecursiveLinks(data);
  }

  console.warn("FALLING BACK TO INDEXING");
  // If fails bc its missing, create a task to index it.
  await indexCID(cid);

  return {status: "scheduled"};
};

// IPFS-GET ENDPOINT: Get the contents of a pinned file/dir on the IPFS network, provided a CID
const get = functions.https.onRequest(async (req, res) => {
  return await corsHandler(req, res, async () => {
    // return await corsHandler(req, res, async () => {
    // ipfs cid to fetch, provided by the client
    const cid = req.query.cid ?? req.body.cid ?? "";

    const result = await getOrEnqueueCID(cid);

    // return the response to the client
    return res.send(result);
  });
});

export default {
  get,
};
