import { useState } from 'react';
import '../pages/styles/Login.css';
import boy from '../assets/images/characters/Boy.png';
import girl from '../assets/images/characters/Girl.png';
import Header from '../components/Header';
const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted:', formData);
    // Add your login logic here
  };

  return (
    <>
    <Header/>
    <div className="login-page">
      {/* Background Image */}
      <div className="login-background"></div>

      {/* Characters */}
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

      {/* Login Card */}
      <div className="login-card-wrapper">
        <div className="login-card">
          <h1 className="login-title">Login</h1>
          
          <div className="login-form-container">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input-login"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input-login"
                placeholder="Enter your password"
                required
              />
              <a href="#forgot" className="forgot-password">Forgot password</a>
            </div>

            <button onClick={handleSubmit} className="login-button">
              Login
            </button>

            <p className="register-text">
              Don't have an account? <a href="#register" className="register-link">Register here!</a>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;