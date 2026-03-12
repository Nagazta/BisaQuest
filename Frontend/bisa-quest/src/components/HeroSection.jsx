import { useNavigate } from "react-router-dom";
import "./HeroSection.css";
import AssetManifest from "../services/AssetManifest";
import ParticleEffects from "../components/ParticleEffects";

const HeroSection = () => {
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
          url(${AssetManifest.ui.dashboardBg}),
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

      <ParticleEffects particleCount={50} enableMouseTrail={true} />

      {/* Center Content */}
      <div className="hero-content-game fade-in">
        <div className="game-title-container">
          <img 
            src={AssetManifest.ui.title} 
            alt="Bisa Quest - Basaha, Tun-i, Daoga - A Journey of Learning and Adventure" 
            className="game-title-image"
          />
        </div>

        <div className="game-buttons">
          <button className="game-btn primary-game-btn" onClick={goToLogin}>
            <span className="btn-text" style={{color: 'transparent'}}>START YOUR QUEST</span>
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
