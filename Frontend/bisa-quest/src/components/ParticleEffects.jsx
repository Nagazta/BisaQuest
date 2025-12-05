import { useState, useEffect } from "react";
import "../pages/styles/GlobalEffects.css";

const ParticleEffects = ({ particleCount = 40, enableMouseTrail = true }) => {
  const [particles] = useState(() => {
    return [...Array(particleCount)].map((_, i) => ({
      id: i,
      type: i % 3 === 0 ? "sparkle" : i % 3 === 1 ? "firefly" : "dust",
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      top: Math.random() * 100,
    }));
  });

  const [mouseTrail, setMouseTrail] = useState([]);

  useEffect(() => {
    if (!enableMouseTrail) return;

    let trailId = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const emitInterval = setInterval(() => {
      const particleCount = Math.floor(Math.random() * 3) + 3; // Original: 3-6 particles

      for (let i = 0; i < particleCount; i++) {
        const newParticle = {
          id: trailId++,
          x: mouseX + (Math.random() - 0.5) * 10,
          y: mouseY + (Math.random() - 0.5) * 10,
          size: Math.random() * 13 + 13, // Original size
          duration: Math.random() * 1 + 1.5,
        };

        setMouseTrail((prev) => [...prev, newParticle]);

        setTimeout(() => {
          setMouseTrail((prev) => prev.filter((p) => p.id !== newParticle.id));
        }, newParticle.duration * 1000);
      }
    }, 50); // Original: 50ms emission rate

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      clearInterval(emitInterval);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [enableMouseTrail]);

  return (
    <>
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
          />
        ))}
      </div>

      {enableMouseTrail && (
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
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ParticleEffects;
