import React from 'react';

const ProfilePicture = ({ src, alt }) => {
  return <img src={src || '/default-pic.jpg'} alt={alt} className="w-20 h-20 rounded-full" />;
};

export default ProfilePicture;