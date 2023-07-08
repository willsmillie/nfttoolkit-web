// check if the link is a youtube link
export const isYouTubeLink = (url) => url?.includes('youtube.com') || url?.includes('youtu.be');

// get the videoId from the youtube link
export const getYouTubeVideoId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/gi;
  const match = regex.exec(url);
  return isYouTubeLink ? match[1] : null;
};

export const getThumbForYouTube = (videoId) => {
  const url = `http://img.youtube.com/vi/${getYouTubeVideoId(videoId)}/hqdefault.jpg`;
  console.log(videoId);
  return url;
};
