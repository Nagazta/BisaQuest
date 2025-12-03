import '../components/styles/ErrorNotification.css'
import ErrorIcon from '../assets/icons/ErrorIcon'
const ErrorNotification = ({ message, onClose }) => {
  if (!message) return null;
  
  return (
    <div className="error-notification">
      <span className="error-icon"><ErrorIcon/></span>
      <div className="error-content">
        <div className="error-title">Unable to Save Language</div>
        <div className="error-message">{message}</div>
      </div>
      <button className="error-close" onClick={onClose}>×</button>
    </div>
  );
};

export default ErrorNotification;