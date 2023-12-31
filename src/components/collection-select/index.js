import { useState, useEffect } from 'react';
import {
  CircularProgress,
  // Tooltip,
  Autocomplete,
  Chip,
  TextField,
  Checkbox,
} from '@mui/material';
import useLoopring from 'src/hooks/useLoopring';
import { parseCollectionId, fetchTokenMetadata, fetchTokenCollectionMetadata } from 'src/hooks/useTokenResolver';
import ConnectButton from 'src/components/ConnectButton';
import { useUnlockContext } from 'src/contexts/unlock-context';

const CollectionSelect = ({ value = null, onChange }) => {
  const { loading, mints, address } = useLoopring();
  const { isUnlocked } = useUnlockContext();

  const [resolvedTokenMetadata, setResolvedTokenMetadata] = useState({});
  const [resolvedCollectionMetadata, setResolvedCollectionMetadata] = useState({});
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [tokensFromCollection, setTokensFromCollection] = useState([]);

  useEffect(() => {
    const resolveMints = async () => {
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
              collectionResults[collectionId] = {
                ...collectionMetadata,
                url: tokenMetadata?.collection_metadata,
              };
            }
          }
        })
      );

      // set the passed ids of the tokens as selected
      const initialTokenIds = Object.keys(tokenResults ?? {}).filter((id) => value?.includes(id));
      setSelectedTokens(initialTokenIds.map((id) => ({ value: id, label: tokenResults[id]?.name ?? id })));

      // set the passed ids of the collections as selected
      const initialCollectionIds = Object.keys(collectionResults ?? {}).filter((id) => value?.includes(id));
      setSelectedCollection(
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
          return collectionId && selectedCollection === collectionId;
        }
        return false;
      })
      .map(([nftId]) => nftId);

    setTokensFromCollection(selectedNFTs);
  }, [resolvedTokenMetadata, selectedCollection]);

  useEffect(() => {
    const prepareResponseForChange = () => {
      // Check if the metadata has been loaded
      const isMetadataLoaded =
        Object.keys(resolvedTokenMetadata).length > 0 && Object.keys(resolvedCollectionMetadata).length > 0;

      if (isMetadataLoaded) {
        onChange(resolvedCollectionMetadata[selectedCollection?.value]);
      }
    };

    prepareResponseForChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCollection, selectedTokens, tokensFromCollection]);

  return !address || !isUnlocked ? (
    <ConnectButton fullWidth />
  ) : (
    <Autocomplete
      fullWidth
      // multiple
      value={selectedCollection}
      options={Object.keys(resolvedCollectionMetadata).map((id) => ({
        value: id,
        label: resolvedCollectionMetadata[id]?.name ?? id,
      }))}
      loading={loading}
      isOptionEqualToValue={(a, b) => a.value === b.value}
      onChange={(event, newValue) => setSelectedCollection(newValue)}
      disableCloseOnSelect
      getOptionLabel={(option) => option?.value ?? ''}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Collections"
          placeholder="Select or Search Collection"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option, { selected }) => (
        <li {...props} key={option.value}>
          <Checkbox key={option.value} size="small" disableRipple checked={selected} />
          {option.label}
        </li>
      )}
      renderTags={(selected, getTagProps) =>
        selected?.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.label}
            label={option.label}
            size="small"
            disabled={selectedCollection === option.value}
          />
        ))
      }
    />
  );
};

export default CollectionSelect;
