import { useState, useEffect } from 'react';
import '../components/styles/HeroSection.css';
import bgImage from '../assets/images/bg-dashboard.png';
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  const navigate = useNavigate();

  const AboutUs = () => {
    navigate('/about');
  };
   const goToLogin = () => {
    navigate("/login"); 
  };
  

  return (
    <section
      className="hero-section game-environment"
      style={{
        backgroundImage: `
          url(${bgImage}),
          radial-gradient(circle at 20% 30%, rgba(255, 220, 117, 0.2) 0%, transparent 100%),
          radial-gradient(circle at 80% 70%, rgba(251, 189, 132, 0.2) 0%, transparent 100%),
          linear-gradient(180deg, #3a322d 0%, #5c4a3f 50%, #3a322d 100%)
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="hero-overlay"></div>

      {/* Animated particles/sparkles */}
      <div className="particle-container">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}></div>
        ))}
      </div>

  

      {/* Center Content */}
      <div className={`hero-content-game ${isVisible ? 'fade-in' : ''}`}>
        <div className="game-title-container">
          <h1 className="game-title epic-text">
            <span className="title-line-1">Adventure</span>
            <span className="title-line-2">Quest</span>
          </h1>
          <div className="title-decoration"></div>
        </div>

        <div className="epic-tagline">
          <h2 className="tagline-main">UNRAVELING READING. ENDLESS ADVENTURE.</h2>
          <p className="tagline-sub">YOUNG READERS NEEDED IN THE LAND OF RISING KNOWLEDGE!</p>
        </div>

        <div className="game-buttons">
          <button className="game-btn primary-game-btn" onClick={goToLogin}>
            <span className="btn-decoration left"></span>
            <span className="btn-text">START YOUR QUEST</span>
            <span className="btn-decoration right"></span>
          </button>
          <button className="game-btn secondary-game-btn" onClick={AboutUs}>
            <span className="btn-text" >LEARN MORE</span>
          </button>
        </div>

      </div>

      {/* Decorative Bottom Border */}
      <div className="hero-bottom-decoration">
        <svg className="decoration-svg" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path d="M0,50 Q300,10 600,50 T1200,50 L1200,100 L0,100 Z" fill="#6B3E1D" opacity="0.3"/>
          <path d="M0,70 Q300,40 600,70 T1200,70 L1200,100 L0,100 Z" fill="#6B3E1D" opacity="0.5"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;