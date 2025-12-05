import './styles/FeedbackNotification.css';

const FeedbackNotification = ({ type = "info", message }) => {
  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✗";
      case "warning":
        return "⚠";
      default:
        return "ⓘ";
    }
  };

  return (
    <div className={`feedback-notification ${type}`}>
      <span className="feedback-icon">{getIcon()}</span>
      <span className="feedback-message">{message}</span>
    </div>
  );
};

export default FeedbackNotification;
