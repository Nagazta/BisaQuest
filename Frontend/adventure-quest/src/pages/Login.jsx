import { useState, useEffect } from "react";
import "../pages/styles/Login.css";
import boy from "../assets/images/characters/Boy.png";
import girl from "../assets/images/characters/Girl.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [particles] = useState(() => {
    return [...Array(30)].map((_, i) => ({
      id: i,
      type: i % 3 === 0 ? "sparkle" : i % 3 === 1 ? "firefly" : "dust",
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      top: Math.random() * 100,
    }));
  });

  const [mouseTrail, setMouseTrail] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "teacher") {
        navigate("/teacher-dashboard");
      } else if (user.role === "student") {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    let trailId = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const emitInterval = setInterval(() => {
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

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  // Replace the handleSubmit function in Login.jsx:
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let email = formData.username;

      // If not an email, convert to BisaQuest student email
      if (!formData.username.includes("@")) {
        email = `${formData.username}@bisaquest.app`;
      }

      const result = await login(email, formData.password);

      if (result.success) {
        if (result.data.user.role === "teacher") {
          navigate("/teacher-dashboard");
        } else if (result.data.user.role === "student") {
          navigate("/dashboard");
        }
      } else {
        setError(result.error || "Login failed.");
      }
    } catch {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = (e) => {
    e.preventDefault();
    navigate("/register");
  };

  return (
    <div className="login-page">
      <div className="login-background"></div>

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

      <div className="character-container">
        <img
          src={boy}
          alt="Boy Character"
          className="character boy-character"
        />
        <img
          src={girl}
          alt="Girl Character"
          className="character girl-character"
        />
      </div>

      <div className="login-card-wrapper">
        <div className="login-card">
          <h1 className="login-title">Login</h1>

          {error && (
            <div
              style={{
                background: "linear-gradient(135deg, #ff6b6b, #ee5a6f)",
                color: "white",
                padding: "1rem",
                borderRadius: "0.75rem",
                marginBottom: "1rem",
                fontWeight: "600",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form-container">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username or Email
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input-login"
                placeholder="Enter your username or email"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input-login"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <a href="#forgot" className="forgot-password">
                Forgot password
              </a>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="register-text">
              Don't have an account?{" "}
              <a
                href="#register"
                className="register-link"
                onClick={goToRegister}
              >
                Register here!
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
