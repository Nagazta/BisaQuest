import React, { useEffect } from "react";
import "./styles/SuccessNotification.css";

const SuccessNotification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="success-notification">
      <div className="success-icon">✓</div>
      <span>{message}</span>
    </div>
  );
};

export default SuccessNotification;
