const getCacheOrFetch = async (db, docId, dispatchIndex) => {
  // attempt to run the query
  const result = await db
      .doc(docId)
      .get()
      .then((res) => res.data())
      .catch((err) => console.error(err.message));

  // if the item exists, return it
  if (result) return result;

  // If it does not exists dispatch a worker to index it
  const ref = await dispatchIndex(docId);

  // tell the client that their request is pending
  return {status: 'indexing', ref};
};

export default getCacheOrFetch;
