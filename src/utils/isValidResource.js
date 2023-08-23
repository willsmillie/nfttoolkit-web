const isValidResource = (url) => {
  try {
    const pattern = /^(ipfs|http|https):\/\/[^ "]+$/;
    return pattern.test(url);
  } catch (error) {
    return false;
  }
};

export default isValidResource;
