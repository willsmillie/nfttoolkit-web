import { ToggleButtonGroup, ToggleButton } from '@mui/material';

const SegmentedButton = ({ selectedOption, setSelectedOption }) => {
  const handleOptionChange = (event, newOption) => {
    if (newOption !== null) {
      setSelectedOption(newOption);
    }
  };

  return (
    <ToggleButtonGroup value={selectedOption} exclusive onChange={handleOptionChange} aria-label="Segmented Button">
      {/* <ToggleButton value="upload" aria-label="Upload">
        Upload
      </ToggleButton> */}
      <ToggleButton value="ipfs" aria-label="IPFS">
        IPFS
      </ToggleButton>
      <ToggleButton value="url" aria-label="URL">
        URL
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default SegmentedButton;
