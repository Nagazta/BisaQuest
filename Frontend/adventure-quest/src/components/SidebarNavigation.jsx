import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import HomeIcon from '../assets/icons/HomeIcon';
import ProgressIcon from '../assets/icons/ProgressIcon';
import BadgesIcon from '../assets/icons/BadgesIcon';
import ProfileIcon from '../assets/icons/ProfileIcon';
import '../components/styles/SidebarNavigation.css';

const SidebarNavigation = ({ onLogout }) => {
  const [activeItem, setActiveItem] = useState('home');

  const navItems = [
    { id: 'profile', label: 'Profiles', icon: <ProfileIcon /> },
    { id: 'home', label: 'Home', icon: <HomeIcon /> },
    { id: 'progress', label: 'Progress', icon: <ProgressIcon /> },
    { id: 'badges', label: 'Badges', icon: <BadgesIcon /> }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">Adventure</h1>
        <h1 className="app-title">Quest</h1>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Button onClick={onLogout} variant="primary" className="logout-btn">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default SidebarNavigation;
