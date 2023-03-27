import JSZip from 'jszip';
import FileSaver from 'file-saver';
import cors from 'cors';
import { getStorage, listAll, ref, getDownloadURL, getMetadata } from 'firebase/storage';
import fetch from 'node-fetch';
import { auth } from './utils/firebase';

const { saveAs } = FileSaver;
const corsHandler = cors({ origin: true });

const downloadFolderAsZip = async (path) => {
  const jszip = new JSZip();
  const storage = getStorage();
  const folderRef = ref(storage, path);
  const folder = await listAll(folderRef);
  const promises = folder.items
    .map(async (item) => {
      const file = await getMetadata(item);
      const fileRef = ref(storage, item.fullPath);
      const fileBlob = await getDownloadURL(fileRef).then((url) => {
        return fetch(url).then((response) => response.blob());
      });
      jszip.file(file.name, fileBlob);
    })
    .reduce((acc, curr) => acc.then(() => curr), Promise.resolve());
  await promises;
  const blob = await jszip.generateAsync({ type: 'blob' });
  saveAs(blob, 'download.zip');
};

// // IPFS-GET ENDPOINT: Get the contents of a pinned file/dir on the IPFS network, provided a CID
// const get = functions.https.onRequest(async (req: any, res: any) => {
//   return await corsHandler(req, res, async () => {
//     // return await corsHandler(req, res, async () => {
//     // ipfs cid to fetch, provided by the client
//     const cid = req.query.cid ?? req.body.cid ?? '';

//     const result = await getOrEnqueueCID(cid);

//     // return the response to the client
//     return res.send(result);
//   });
// });

export default {
  downloadFolderAsZip,
};
