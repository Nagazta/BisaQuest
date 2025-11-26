import { useState } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


import '../components/styles/Header.css';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

  const goHome = () => {
    navigate("/"); // Navigate to HomePage
  };

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/about' },
  { name: 'Features', href: '/features' },
  { name: 'Contact', href: '/contact' },
];


  return (
    <header className="header-container">
      <div className="content-wrapper">
        {/* Logo Section */}
        <div className="logo-section" onClick={goHome} style={{ cursor: "pointer" }}>
          <svg
            className="logo-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            fill="none"
          >
            <circle cx="32" cy="32" r="30" stroke="#FCD765" strokeWidth="4" />
            <path d="M32 10L24 30H40L32 10Z" fill="#FCD765" />
            <path d="M32 54L24 34H40L32 54Z" fill="#FCD765" />
            <circle cx="32" cy="32" r="6" fill="#FCD765" />
          </svg>
          <label className="brand-name" onClick={goHome} style={{ cursor: "pointer" }}>Adventure Quest</label>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          {navItems.map((item) => (
            <Link key={item.name} to={item.href} className="nav-link">
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;