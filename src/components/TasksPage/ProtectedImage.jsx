import React, { useState, useEffect } from 'react';

export const ProtectedImage = ({ url, filename }) => {
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    import('../../api/axiosConfig').then(m => {
      m.default.get(url, { responseType: 'blob' }).then(res => {
        setImgSrc(URL.createObjectURL(res.data));
      });
    });
    return () => { if (imgSrc) URL.revokeObjectURL(imgSrc); };
  }, [url]);

  if (!imgSrc) return <div className="w-full h-32 bg-gray-100 animate-pulse rounded-xl" />;
  
  return (
    <img 
      src={imgSrc} 
      alt={filename} 
      className="rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:opacity-90 transition-all max-h-64 object-cover"
      onClick={() => window.open(imgSrc, '_blank')}
    />
  );
};