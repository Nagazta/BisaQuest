import { useState, useEffect } from "react";
import "./Login.css";
import "./GlobalEffects.css";
import boy from "../assets/images/characters/Boy.png";
import girl from "../assets/images/characters/Girl.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ParticleEffects from "../components/ParticleEffects";
import SaveProgressModal from "../components/progress/SaveProgressModal";

const Login = () => {
  const navigate = useNavigate();
  const { user, createNewUser, hardLogout, getStats } = useAuth();
  
  const [nickname, setNickname] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Check for existing account on mount - but skip if we just chose to continue
  useEffect(() => {
    const justChoseContinue = sessionStorage.getItem('bisaquest_continue_clicked');
    
    if (justChoseContinue) {
      // User just clicked continue - don't show modal again, let AuthContext load
      console.log('🔄 User chose continue, waiting for AuthContext to load user...');
      sessionStorage.removeItem('bisaquest_continue_clicked');
      return;
    }
    
    const checkForAccount = async () => {
      const userId = localStorage.getItem('bisaquest_user_id');
      const studentId = localStorage.getItem('bisaquest_student_id');
      
      if (userId && studentId && !user) {
        console.log('🔍 Existing account detected in localStorage');
        setShowAccountModal(true);
        
        // Try to load stats
        try {
          const result = await getStats();
          if (result.success) {
            setStats(result.data);
            console.log('📊 Stats loaded for modal:', result.data);
          }
        } catch (error) {
          console.error('Failed to load stats:', error);
        }
      }
    };
    
    checkForAccount();
  }, [user, getStats]);

  // Load stats for returning players with active session
  useEffect(() => {
    const loadStats = async () => {
      if (user && user.id) {
        console.log('📊 Loading stats for user:', user.nickname);
        try {
          const result = await getStats();
          if (result.success) {
            setStats(result.data);
            console.log('✅ Stats loaded:', result.data);
          }
        } catch (error) {
          console.error('❌ Error loading stats:', error);
        }
      }
    };
    
    loadStats();
  }, [user, getStats]);

  // Auto-navigate to dashboard when user loads
  useEffect(() => {
    if (user && !showAccountModal) {
      console.log('✅ User loaded, navigating to dashboard');
      navigate("/dashboard");
    }
  }, [user, showAccountModal, navigate]);

  const handleContinueExisting = () => {
    console.log('✅ User chose to continue with existing account');
    // Mark that user chose to continue
    sessionStorage.setItem('bisaquest_continue_clicked', 'true');
    // Reload to let AuthContext load the user
    window.location.reload();
  };

  const handleCreateNewFromModal = async () => {
    console.log('🆕 User chose to create new account from modal');
    await hardLogout();
    setShowAccountModal(false);
    setStats(null);
  };

  const handleCloseModal = () => {
    // Don't allow closing - user must choose
    console.log('ℹ️ Modal close blocked - user must choose an option');
  };

  const handlePlayNow = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!nickname.trim()) {
      setError('Please enter your name to start playing!');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('🎮 Starting game with nickname:', nickname.trim());
      
      const result = await createNewUser(nickname.trim());
      
      if (!result.success) {
        setError(result.error || 'Failed to create user. Please try again!');
        console.error('❌ Failed to create user:', result.error);
        return;
      }
      
      console.log('✅ User created successfully, navigating to dashboard...');
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Error starting game:", error);
      setError("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  // If modal is showing, only render background and modal
  if (showAccountModal) {
    return (
      <div className="login-page">
        <div className="login-background"></div>
        <ParticleEffects enableMouseTrail={true} />
        
        <SaveProgressModal
          isOpen={showAccountModal}
          onContinue={handleContinueExisting}
          onNewGame={handleCreateNewFromModal}
          onClose={handleCloseModal}
        />
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-background"></div>
      <ParticleEffects enableMouseTrail={true} />

      <div className="character-container">
        <img src={boy} alt="Boy Character" className="character boy-character" />
        <img src={girl} alt="Girl Character" className="character girl-character" />
      </div>

      <div className="login-card-wrapper">
        <div className="login-card">
          <h1 className="login-title">BisaQuest</h1>
          
          {error && (
            <div className="error-message-box">
              {error}
            </div>
          )}
          
          <p className="welcome-subtitle">
            Start your Cebuano learning adventure!
          </p>

          <form onSubmit={handlePlayNow} className="login-form-container">
            <div className="form-group">
              <label htmlFor="nickname" className="form-label">
                Enter Your Name
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="form-input-login"
                placeholder="Your name here"
                maxLength={50}
                required
                autoFocus
                disabled={loading}
              />
            </div>

            <button 
              type="submit"
              className="login-button"
              disabled={loading || !nickname.trim()}
            >
              {loading ? "Creating..." : "Play Now"}
            </button>
          </form>

          <div className="game-info">
            <p className="info-text">
              Your progress will be saved automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;