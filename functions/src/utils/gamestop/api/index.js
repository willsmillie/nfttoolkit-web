const base = "https://api.nft.gamestop.com/nft-svc-marketplace/"

const getCollections = async (creatorAddress) => {
  const url = base + `getCollectionsPaginated?limit=50&creatorEthAddress=${creatorAddress}`

  return fetch(url)
    .then(res => res.json())
    .then(json => json?.data)
}

module.exports = {
  getCollections
}
