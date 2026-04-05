import React from 'react';
import '../../styles/components/buttons.css';

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  
  return (
    <button 
      className={`btn ${variantClass} ${sizeClass} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
