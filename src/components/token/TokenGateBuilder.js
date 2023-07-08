import { useState, useEffect } from 'react';
import { Typography, Stack, Tooltip } from '@mui/material';
import Select from 'react-select';
import useLoopring from '../../hooks/useLoopring';

// Import the fetchTokenMetadata function
import { parseCollectionId, fetchTokenMetadata, fetchTokenCollectionMetadata } from '../../hooks/useTokenResolver';

const TokenGateBuilder = ({ value, onChange }) => {
  const { mints } = useLoopring();

  const [resolvedTokenMetadata, setResolvedTokenMetadata] = useState({});
  const [resolvedCollectionMetadata, setResolvedCollectionMetadata] = useState({});
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [tokensFromCollection, setTokensFromCollection] = useState([]);

  useEffect(() => {
    const resolveMints = async () => {
      console.log(mints);
      const tokenResults = {};
      const collectionResults = {};

      await Promise.all(
        mints.map(async (nft) => {
          const tokenMetadata = await fetchTokenMetadata(nft.nftId);

          if (tokenMetadata) {
            tokenResults[nft.nftId] = tokenMetadata;

            const collectionId = parseCollectionId(tokenMetadata?.collection_metadata);
            if (collectionId) {
              const collectionMetadata = await fetchTokenCollectionMetadata(tokenMetadata);
              collectionResults[collectionId] = collectionMetadata;
            }
          }
        })
      );

      // set the passed ids of the tokens as selected
      const initialTokenIds = Object.keys(tokenResults).filter((id) => value.includes(id));
      setSelectedTokens(initialTokenIds.map((id) => ({ value: id, label: tokenResults[id]?.name ?? id })));

      // set the passed ids of the collections as selected
      const initialCollectionIds = Object.keys(collectionResults).filter((id) => value.includes(id));
      setSelectedCollections(
        initialCollectionIds.map((id) => ({ value: id, label: collectionResults[id]?.name ?? id }))
      );

      setResolvedTokenMetadata(tokenResults);
      setResolvedCollectionMetadata(collectionResults);
    };

    resolveMints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mints]);

  useEffect(() => {
    const selectedNFTs = Object.entries(resolvedTokenMetadata)
      // eslint-disable-next-line no-unused-vars
      .filter(([nftId, metadata]) => {
        if (metadata.collection_metadata) {
          const collectionId = parseCollectionId(metadata.collection_metadata);
          return collectionId && selectedCollections.map((e) => e.value).includes(collectionId);
        }
        return false;
      })
      .map(([nftId]) => nftId);

    setTokensFromCollection(selectedNFTs);
  }, [resolvedTokenMetadata, selectedCollections]);

  const derivedSelection = [...new Set([...tokensFromCollection, ...selectedTokens.map((e) => e.value)])]?.map(
    (nftId) => {
      const metadata = resolvedTokenMetadata[nftId];
      return {
        value: nftId,
        label: metadata ? metadata.name : nftId,
      };
    }
  );

  const styles = {
    multiValue: (base, state) => ({
      ...base,
      backgroundColor: tokensFromCollection.includes(state.data.value) ? 'gray' : base.backgroundColor,
    }),
    multiValueLabel: (base, state) => ({
      ...base,
      color: tokensFromCollection.includes(state.data.value) ? 'white' : base.color,
      paddingRight: tokensFromCollection.includes(state.data.value) ? 6 : base.paddingRight,
    }),
    multiValueRemove: (base, state) => ({
      ...base,
      display: tokensFromCollection.includes(state.data.value) ? 'none' : base.display,
      background: tokensFromCollection.includes(state.data.value) ? 'red' : base.background,
    }),
  };

  useEffect(() => {
    const prepareResponseForChange = () => {
      const gateIds = [selectedTokens, selectedCollections]
        .flat()
        .map((e) => e.value)
        .filter((id) => !tokensFromCollection.includes(id));

      // Check if the metadata has been loaded
      const isMetadataLoaded =
        Object.keys(resolvedTokenMetadata).length > 0 && Object.keys(resolvedCollectionMetadata).length > 0;

      if (isMetadataLoaded) {
        onChange(gateIds);
      }
    };

    prepareResponseForChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCollections, selectedTokens, tokensFromCollection]);

  return (
    <Stack spacing={2}>
      <Tooltip
        title={'Users holding any tokens within the selected collection(s) will have access to these files.'}
        placement="top-start"
        key={'collection-tip'}
      >
        <Typography>Collections: </Typography>
      </Tooltip>
      <Select
        closeMenuOnSelect={false}
        value={selectedCollections}
        isMulti
        options={Object.keys(resolvedCollectionMetadata).map((id) => ({
          value: id,
          label: resolvedCollectionMetadata[id]?.name ?? id,
        }))}
        onChange={setSelectedCollections}
        menuPortalTarget={document.body}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      />

      <Tooltip
        title={'Users holding any of the selected tokens will have access to these files.'}
        placement="top-start"
        key={'tokens-tip'}
      >
        <Typography>Tokens: </Typography>
      </Tooltip>
      <Select
        closeMenuOnSelect={false}
        value={derivedSelection}
        isClearable={derivedSelection.filter(({ value }) => !tokensFromCollection.includes(value))}
        isMulti
        options={mints?.map((e) => ({
          value: e?.nftId,
          label: resolvedTokenMetadata[e?.nftId]?.name || e?.nftId,
        }))}
        onChange={setSelectedTokens}
        menuPortalTarget={document.body}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }), ...styles }}
      />
    </Stack>
  );
};

export default TokenGateBuilder;
