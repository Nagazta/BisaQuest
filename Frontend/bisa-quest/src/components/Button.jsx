import React from 'react';
import '../components/styles/Button.css';

const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
};
export default Button;
