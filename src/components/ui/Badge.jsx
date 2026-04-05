import React from 'react';
import '../../styles/components/badges.css';

const Badge = ({ children, status = 'success', className = '', ...props }) => {
  return (
    <span 
      className={`vini-badge ${status} ${className}`} 
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
