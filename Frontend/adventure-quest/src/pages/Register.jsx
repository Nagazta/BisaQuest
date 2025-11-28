import { useState, useEffect } from "react";
import "../pages/styles/Login.css";
import "../pages/styles/Register.css";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

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
    firstName: "",
    lastName: "",
    middleName: "",
    relationship: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const goToLogin = () => {
    navigate("/login");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registration submitted:", formData);
  };

  return (
    <div className="login-page">
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

      <div className="login-background"></div>

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
          />
        ))}
      </div>

      <div className="login-card-wrapper register-card-wrapper">
        <div className="login-card register-card">
          <h1 className="login-title">Registration</h1>

          <div className="login-form-container register-form-container">
            <div className="form-row">
              <div className="form-group-small">
                <label htmlFor="firstName" className="form-label">
                  Full name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input form-input-small"
                  placeholder="Enter First Name"
                  required
                />
              </div>

              <div className="form-group-small">
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input form-input-small"
                  placeholder="Enter Last Name"
                  required
                  style={{ marginTop: "1.5rem" }}
                />
              </div>

              <div className="form-group-small">
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="form-input form-input-small"
                  placeholder="Enter Middle Name"
                  style={{ marginTop: "1.5rem" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="relationship" className="form-label">
                Relationship to student
              </label>
              <select
                id="relationship"
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                className="form-input form-select"
                required
              >
                <option value="">Select relationship</option>
                <option value="parent">Parent</option>
                <option value="guardian">Guardian</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group-small">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input form-input-small"
                  placeholder="Enter Username"
                  required
                />
              </div>

              <div className="form-group-small">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input form-input-small"
                  placeholder="Enter Email"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-small">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input form-input-small"
                  placeholder="Enter Password"
                  required
                />
              </div>

              <div className="form-group-small">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input form-input-small"
                  placeholder="Confirm Password"
                  required
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="login-button register-button"
            >
              Register
            </button>

            <p className="register-text register-link-text">
              Already have an account?{" "}
              <a href="#login" className="register-link" onClick={goToLogin}>
                Login here!
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
