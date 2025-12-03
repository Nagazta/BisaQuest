import { useState, useEffect } from "react";
import "../components/styles/HeroSection.css";
import bgImage from "../assets/images/bg-dashboard.png";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [particles] = useState(() => {
    // Generate particles once during initial render
    return [...Array(30)].map((_, i) => ({
      id: i,
      type: i % 3 === 0 ? "sparkle" : i % 3 === 1 ? "firefly" : "dust",
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      top: Math.random() * 100,
    }));
  });

  // Mouse trail effect
  const [mouseTrail, setMouseTrail] = useState([]);

  useEffect(() => {
    let trailId = 0;
    let mouseX = 0;
    let mouseY = 0;

    // Track mouse position
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Emit particles continuously every 50ms
    const emitInterval = setInterval(() => {
      // Create 2-3 particles per emission for cloud effect
      const particleCount = Math.floor(Math.random() * 3) + 3;

      for (let i = 0; i < particleCount; i++) {
        const newParticle = {
          id: trailId++,
          x: mouseX + (Math.random() - 0.5) * 10,
          y: mouseY + (Math.random() - 0.5) * 10,
          size: Math.random() * 12 + 12,
          duration: Math.random() * 1 + 1.5,
        };

        setMouseTrail((prev) => [...prev, newParticle]);

        // Remove particle after its duration
        setTimeout(() => {
          setMouseTrail((prev) => prev.filter((p) => p.id !== newParticle.id));
        }, newParticle.duration * 1000);
      }
    }, 50);

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      clearInterval(emitInterval);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const navigate = useNavigate();

  const AboutUs = () => {
    navigate("/about");
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
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="hero-overlay"></div>

      {/* Animated particles/sparkles */}
      <div className="particle-container">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`particle ${particle.type}`}
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              top: `${particle.top}%`,
            }}
          ></div>
        ))}
      </div>

      {/* Mouse Trail - Golden Circles */}
      <div className="mouse-trail-container">
        {mouseTrail.map((particle) => (
          <div
            key={particle.id}
            className="mouse-circle"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Center Content */}
      <div className="hero-content-game fade-in">
        <div className="game-title-container">
          <h1 className="game-title epic-text">
            <span className="title-line-1">Adventure</span>
            <span className="title-line-2">Quest</span>
          </h1>
          <div className="title-decoration"></div>
        </div>

        <div className="epic-tagline">
          <h2 className="tagline-main">
            UNRAVELING READING. ENDLESS ADVENTURE.
          </h2>
          <p className="tagline-sub">
            YOUNG READERS NEEDED IN THE LAND OF RISING KNOWLEDGE!
          </p>
        </div>

        <div className="game-buttons">
          <button className="game-btn primary-game-btn" onClick={goToLogin}>
            <span className="btn-decoration left"></span>
            <span className="btn-text">START YOUR QUEST</span>
            <span className="btn-decoration right"></span>
          </button>
        </div>
      </div>

      {/* Decorative Bottom Border */}
      <div className="hero-bottom-decoration">
        <svg
          className="decoration-svg"
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 Q300,10 600,50 T1200,50 L1200,100 L0,100 Z"
            fill="#6B3E1D"
            opacity="0.3"
          />
          <path
            d="M0,70 Q300,40 600,70 T1200,70 L1200,100 L0,100 Z"
            fill="#6B3E1D"
            opacity="0.5"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
