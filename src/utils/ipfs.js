import { getCID } from '../API';

// Fetch the file graph
export const getDAGForCID = async (cid) => {
  try {
    const dagNode = await getCID(cid.replace('ipfs://', ''));

    return dagNode;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
