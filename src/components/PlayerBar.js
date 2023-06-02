import React, { useEffect, useState, useRef } from 'react';
import YouTube from 'react-youtube';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import FastForwardRounded from '@mui/icons-material/FastForwardRounded';
import FastRewindRounded from '@mui/icons-material/FastRewindRounded';
import useIPFS from '../hooks/useIPFS';

const Widget = styled('div')(() => ({
  paddingRight: 16,
  paddingLeft: 16,
  borderRadius: 0,
  bottom: 0,
  left: 0,
  right: 0,
  minHeight: 44,
  maxWidth: '100%',
  margin: 0,
  position: 'fixed',
  bgcolor: 'background.paper',
}));

const TinyText = styled(Typography)({
  fontSize: '0.75rem',
  opacity: 0.38,
  fontWeight: 500,
  letterSpacing: 0.2,
});

export default function PlayerBar({ track, onToggle, setIsPlaying, isPlaying, onNext, onLast }) {
  const { ipfsToHttp } = useIPFS();
  const [isAudioReady, setIsAudioReady] = useState(false);

  const path = ipfsToHttp(track?.url ?? '');

  const audio = new Audio(path);
  const audioRef = useRef(audio);
  const intervalRef = useRef();

  const duration = audioRef.current.duration || 0;
  const currentTime = audioRef.current.currentTime || 0;
  const [trackProgress, setTrackProgress] = useState(0);

  const startTimer = () => {
    // Clear any timers already running
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (audioRef.current.ended) {
        onNext();
      } else {
        setTrackProgress(audioRef.current.currentTime);
      }
    }, [1000]);
  };

  useEffect(() => {
    const audio = audioRef.current;

    const handlePlay = () => {
      const playPromise = audio.play();
      if (playPromise) {
        playPromise
          .then(() => {
            if (audio.currentTime !== trackProgress) {
              audio.currentTime = trackProgress;
            }
            startTimer();
          })
          .catch((error) => {
            console.log('Failed to play audio:', error);
          });
      }
    };

    const handlePause = () => {
      audio.pause();
      audio.currentTime = 0;
      clearInterval(intervalRef.current);
    };

    if (isPlaying) {
      handlePlay();
    } else {
      handlePause();
    }

    return () => {
      handlePause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // Handles cleanup and setup when changing tracks
  useEffect(() => {
    const audio = audioRef.current || new Audio(path);

    const handleAudioSetup = () => {
      if (audio.src !== path) {
        audio.pause();
        audio.src = path;
        audio.load();
        setTrackProgress(0);

        if (isAudioReady) {
          setIsPlaying(true);
          startTimer();
        } else {
          setIsAudioReady(true);
        }
      }
    };

    handleAudioSetup();

    return () => {
      audio.pause();
      clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  const onScrub = (value) => {
    // Clear any timers already running
    clearInterval(intervalRef.current);
    audioRef.current.currentTime = value;
    setTrackProgress(audioRef.current.currentTime);
  };

  const onScrubEnd = () => {
    // If not already playing, start
    if (!isPlaying) {
      setIsPlaying(true);
    }
    startTimer();
  };

  function formatDuration(value) {
    const minute = Math.floor(value / 60);
    const secondLeft = value - minute * 60;
    return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
  }

  const mainIconColor = '#fff';

  const handleOnReady = () => {
    // setDuration(audioRef.current.getDuration());
    // isReady.current = true;
  };

  const handleOnStateChange = (event) => {
    const { data } = event;
    if (data === 0) {
      // Video ended, play next track
      onNext();
    }
  };

  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: isPlaying ? 1 : 0,
      origin: window.location.origin,
    },
  };
  const isYouTubeLink = track?.url?.includes('youtube.com') || track?.url?.includes('youtu.be');
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/gi;
  const match = regex.exec(track?.url);
  const videoId = isYouTubeLink ? match[1] : null;

  return (
    track && (
      <Widget>
        {isYouTubeLink ? (
          <YouTube videoId={videoId} opts={opts} onReady={handleOnReady} onStateChange={handleOnStateChange} />
        ) : (
          <></>
        )}

        <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconButton aria-label="previous song" onClick={onLast}>
              <FastRewindRounded fontSize="large" htmlColor={mainIconColor} />
            </IconButton>
            <IconButton aria-label={isPlaying ? 'pause' : 'play'} onClick={onToggle}>
              {isPlaying ? (
                <PauseRounded sx={{ fontSize: '3rem' }} htmlColor={mainIconColor} />
              ) : (
                <PlayArrowRounded sx={{ fontSize: '3rem' }} htmlColor={mainIconColor} />
              )}
            </IconButton>
            <IconButton aria-label="next song" onClick={onNext}>
              <FastForwardRounded fontSize="large" htmlColor={mainIconColor} />
            </IconButton>
          </Box>
          <TinyText>{formatDuration(currentTime.toFixed(0))}</TinyText>

          <Slider
            aria-label="time-indicator"
            size="small"
            value={trackProgress}
            min={0}
            max={Number(duration.toFixed(0))}
            onMouseUp={onScrubEnd}
            onKeyUp={onScrubEnd}
            onChange={(x, value) => {
              onScrub(value);
            }}
            sx={{
              color: '#fff',
              height: 4,
              '& .MuiSlider-thumb': {
                width: 8,
                height: 8,
                transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                '&:before': {
                  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                },
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0px 0px 0px 8px rgb(255 255 255 / 16%)',
                },
                '&.Mui-active': {
                  width: 20,
                  height: 20,
                },
              },
              '& .MuiSlider-rail': {
                opacity: 0.28,
              },
            }}
          />
          <TinyText>-{formatDuration((duration - currentTime).toFixed(0))}</TinyText>
        </Stack>
      </Widget>
    )
  );
}
