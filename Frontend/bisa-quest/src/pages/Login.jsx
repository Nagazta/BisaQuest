import { useState, useEffect } from "react";
import "../pages/styles/Login.css";
import "../pages/styles/GlobalEffects.css";
import boy from "../assets/images/characters/Boy.png";
import girl from "../assets/images/characters/Girl.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ParticleEffects from "../components/ParticleEffects";



const Login = () => {
  const navigate = useNavigate();
  const { login, loginStudent, user } = useAuth();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("student");

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
    studentId: "",
    classCode: "",
    identifier: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;
      if (userType === "student") {
        console.log("Attempting student login with:", formData);

        result = await loginStudent(formData.studentId, formData.classCode);
        console.log("Login result:", result);

        if (result.success) {
          const student_id = result.data.roleData?.student_id || formData.studentId;
          console.log("Resolved student_id:", student_id);

          const session = {
            user: {
              id: result.data.user.user_id,
              student_id: student_id,
              role: "student"
            }
          };

          console.log("Storing session:", session);

          localStorage.setItem("session", JSON.stringify(session));
          localStorage.setItem("studentId", student_id);

          console.log("Student ID saved in localStorage:", localStorage.getItem("studentId"));

          navigate("/dashboard");
          return;
        }
      } else {
        const email = formData.identifier.includes("@")
          ? formData.identifier
          : `${formData.identifier}@gmail.com`;

        console.log("Attempting teacher login with:", email);

        result = await login(email, formData.password);
        console.log("Login result:", result);

        if (result.success) {
          navigate("/teacher-dashboard");
          return;
        }
      }

      if (!result.success) {
        console.log("Login failed with error:", result.error);
        setError(result.error || "Login failed");
      }
    } catch (err) {
      console.error("Unexpected error during login:", err);
      setError("An unexpected error occurred");
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

      <ParticleEffects enableMouseTrail={true} />

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

          {error && <div className="error-message-box">{error}</div>}

          <div className="user-type-toggle">
            <button
              type="button"
              className={userType === "student" ? "active" : ""}
              onClick={() => setUserType("student")}
            >
              <span>STUDENT</span>
            </button>
            <button
              type="button"
              className={userType === "teacher" ? "active" : ""}
              onClick={() => setUserType("teacher")}
            >
              <span>TEACHER</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form-container">
            {userType === "student" ? (
              <>
                <div className="form-group">
                  <label htmlFor="studentId" className="form-label">
                    Student ID
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="form-input-login"
                    placeholder="Enter your student ID"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="classCode" className="form-label">
                    Class Code
                  </label>
                  <input
                    type="text"
                    id="classCode"
                    name="classCode"
                    value={formData.classCode}
                    onChange={handleChange}
                    className="form-input-login"
                    placeholder="Enter your class code"
                    required
                    disabled={loading}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="identifier" className="form-label">
                    Email
                  </label>
                  <input
                    type="text"
                    id="identifier"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    className="form-input-login"
                    placeholder="Enter your email"
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
              </>
            )}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            {userType === "teacher" && (
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
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
