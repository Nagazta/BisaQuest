import React from "react";
import "../components/styles/Button.css";

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled,
}) => {
  const baseClass = variant === "custom" ? "" : "btn";
  const variantClass = variant === "custom" ? "" : `btn-${variant}`;

  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${variantClass} ${className}`.trim()}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
export default Button;
