import { getAccountById } from 'src/utils/web3';

// snapshot the holders of a given token via nftData param
// automatically fetches all paginated results
export const getHoldersForNFTData = async (nftData, apiKey) => {
  const results = [];
  let totalNum = null;
  const batchSize = 50;
  let offset = 0;

  while (totalNum === null || results.length < totalNum) {
    console.log(`fetching ${nftData} page: ${offset / batchSize}`);
    const url = `https://api3.loopring.io/api/v3/nft/info/nftHolders?nftData=${nftData}&offset=${offset}&limit=${batchSize}`;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
    })
      .then((res) => res.json())
      .catch(console.error);

    if (!totalNum && res?.totalNum) {
      const newTotal = res.totalNum;
      totalNum = newTotal;
    }
    if (res?.nftHolders?.length === 0 || res?.nftHolders === undefined) break;
    results.push(...(res?.nftHolders ?? []));

    offset = results.length;
  }

  return results;
};

// resolve account 0x addresses via a list of account Ids (loopring account 12345)
export async function getAccountsByIds(accountIds) {
  if (accountIds?.length === 0) return [];
  const reqs = accountIds.map((acct) => getAccountById(acct));
  return Promise.all(reqs);
}
