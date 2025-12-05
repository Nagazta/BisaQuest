import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import HomeIcon from "../assets/icons/HomeIcon";
import ProgressIcon from "../assets/icons/ProgressIcon";
import BadgesIcon from "../assets/icons/BadgesIcon";
import "../components/styles/SidebarNavigation.css";

const SidebarNavigation = ({ onLogout }) => {
  const { user } = useAuth();
  // console.log("👤 Sidebar user data:", user);
  const [activeItem, setActiveItem] = useState("home");

  const navItems = [
    { id: "home", label: "Home", icon: <HomeIcon /> },
    { id: "progress", label: "Progress", icon: <ProgressIcon /> },
    { id: "badges", label: "Badges", icon: <BadgesIcon /> },
  ];

  const handleProfileClick = () => {
    setActiveItem("profile");
    console.log("Profile clicked");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
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

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={`nav-item ${activeItem === item.id ? "active" : ""}`}
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
