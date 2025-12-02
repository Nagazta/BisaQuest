
import React, { useState } from 'react';
import Button from '../components/Button';

// UserProfileHeader Component - uses Button for profile
const UserProfileHeader = ({ userName, profilePicture }) => {
  return (
    <div className="user-profile-header">
      <span className="user-name">{userName}</span>
      <Button variant="profile" className="profile-picture">
        {profilePicture ? (
          <img src={profilePicture} alt={userName} />
        ) : (
          <div className="profile-placeholder">{userName.charAt(0)}</div>
        )}
      </Button>
    </div>
  );
};

export default UserProfileHeader;