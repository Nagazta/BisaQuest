import { useState, useEffect } from "react";
import "../pages/styles/Login.css";
import "../pages/styles/Register.css";
import "../pages/styles/GlobalEffects.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ParticleEffects from "../components/ParticleEffects";

const Register = () => {
  const navigate = useNavigate();
  const { register, user } = useAuth();

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

      <ParticleEffects enableMouseTrail={true} />

      {/* Register Card */}
      <div className="register-card-wrapper">
        <div className="register-card">
          <h1 className="login-title">Registration</h1>

          {error && <div className="error-message-box">{error}</div>}

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
            <div className="important-notice">
              <div className="important-notice-content">
                <span className="important-notice-icon">⚠</span>
                <div>
                  <strong>Important Notice</strong>
                  <p>
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
