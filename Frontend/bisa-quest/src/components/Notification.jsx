import { useEffect } from "react";
import "./styles/Notification.css";
import ErrorIcon from "../assets/icons/ErrorIcon";

const Notification = ({ type = "success", message, onClose, title }) => {
  useEffect(() => {
    if (type === "success") {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

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

      {type === "error" && (
        <button className="notification-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

export default Notification;
