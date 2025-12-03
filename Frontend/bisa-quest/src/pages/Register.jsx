import { useState, useEffect } from "react";
import "../pages/styles/Login.css";
import "../pages/styles/Register.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register, user } = useAuth();

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
    firstName: "",
    lastName: "",
    teacherID: "",
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
    if (error) setError("");
  };

  const goToLogin = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // Pass teacherID instead of middleName
      const result = await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.teacherID
      );

      if (result.success) {
        alert("Register Sucessfuly! Navigating to login");
        navigate("/login");
      } else {
        setError(result.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background - FIRST */}
      <div className="login-background"></div>

      {/* Particles - SECOND */}
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

      {/* Mouse Trail - THIRD */}
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

      {/* Register Card */}
      <div className="register-card-wrapper">
        <div className="register-card">
          <h1 className="login-title">Registration</h1>

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
                marginLeft: "4rem",
                marginRight: "4rem",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form-container">
            {/* Full Name Row */}
            <div className="form-row">
              <div className="form-group-small">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input-small"
                  placeholder="First Name"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group-small">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input-small"
                  placeholder="Last Name"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group-small">
                <label className="form-label">Teacher ID</label>
                <input
                  type="text"
                  name="teacherID"
                  value={formData.teacherID}
                  onChange={handleChange}
                  className="form-input-small"
                  placeholder="Teacher ID (Optional)"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input-small"
                placeholder="Enter Email"
                required
                disabled={loading}
              />
            </div>

            {/* Password Row */}
            <div className="form-row">
              <div className="form-group-small">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input-small"
                  placeholder="Enter Password"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group-small">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input-small"
                  placeholder="Confirm Password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="login-button register-button"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            {/* Login Link */}
            <p className="register-text register-link-text">
              Already have an account?{" "}
              <a href="#login" className="register-link" onClick={goToLogin}>
                Login here!
              </a>
            </p>

            {/* Important Notice */}
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                background: "linear-gradient(135deg, #FFF9E6 0%, #FFF4D1 100%)",
                border: "3px solid #FCD765",
                borderRadius: "0.75rem",
                fontSize: "0.85rem",
                color: "#6B3E1D",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>⚠</span>
                <div>
                  <strong style={{ display: "block", marginBottom: "0.25rem" }}>
                    Important Notice
                  </strong>
                  <p style={{ margin: "0.25rem 0" }}>
                    Only teachers can create accounts. Students will be created
                    by their teachers after registration is complete.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
