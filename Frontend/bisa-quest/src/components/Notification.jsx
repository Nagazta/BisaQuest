import { useEffect } from "react";
import "./styles/Notification.css";
import ErrorIcon from "../assets/icons/ErrorIcon";

const Notification = ({ type = "success", message, onClose, title }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!message) return null;

  return (
    <div className={`notification notification-${type}`}>
      <span className="notification-icon">
        {type === "error" ? <ErrorIcon /> : "✓"}
      </span>

      <div className="notification-content">
        {type === "error" && title && (
          <div className="notification-title">{title}</div>
        )}
        <div className="notification-message">{message}</div>
      </div>
    </div>
  );
};

export default Notification;
