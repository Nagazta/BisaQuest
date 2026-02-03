import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import HomeIcon from "../assets/icons/HomeIcon";
import ProgressIcon from "../assets/icons/ProgressIcon";
import BadgesIcon from "../assets/icons/BadgesIcon";
import "./HamburgerMenu.css";

const HamburgerMenu = ({ onLogout }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("home");

  const navItems = [
    { id: "home", label: "Home", icon: <HomeIcon /> },
    { id: "progress", label: "Progress", icon: <ProgressIcon /> },
    { id: "badges", label: "Badges", icon: <BadgesIcon /> },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleProfileClick = () => {
    setActiveItem("profile");
    console.log("Profile clicked");
  };

  const handleNavClick = (itemId) => {
    setActiveItem(itemId);
    // Close menu on mobile after selection
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Hamburger Button - Fixed Top Left */}
      <button 
        className="hamburger-button" 
        onClick={toggleMenu}
        aria-label="Menu"
      >
        <div className={`hamburger-icon ${isOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Overlay - Dims background when menu is open */}
      {isOpen && (
        <div 
          className="menu-overlay" 
          onClick={toggleMenu}
        />
      )}

      {/* Slide-out Menu */}
      <div className={`slide-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h1 className="app-title">BisaQuest</h1>
        </div>

        {/* Clickable Student Profile Section */}
        <button
          className={`student-profile ${
            activeItem === "profile" ? "active" : ""
          }`}
          onClick={handleProfileClick}
        >
          <div className="student-info">
            <p className="student-name">
              {user?.fullname ? user.fullname.split(" ")[0] : "Adventurer"}
            </p>
            <p className="student-role">Young Adventurer</p>
          </div>
        </button>

        <nav className="menu-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`nav-item ${activeItem === item.id ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="menu-footer">
          <Button onClick={onLogout} variant="primary" className="logout-btn">
            Logout
          </Button>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;