const getSecureUrl = (url) => {
  if (!url) return '';
  if (window.location.protocol === 'https:' && url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};