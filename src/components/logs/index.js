import { useEffect, useRef } from 'react';
import { Typography } from '@mui/material';
import ScrollBar from '../Scrollbar';

export default function Logs({ log }) {
  const logsEndRef = useRef(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [log]);

  return (
    <ScrollBar sx={{ maxHeight: 400, minWidth: 300 }} id="logs">
      <Typography sx={{ fontFamily: 'Monospace', lineHeight: -2 }} variant="caption">
        {log}
      </Typography>
      <div ref={logsEndRef} />
    </ScrollBar>
  );
}
