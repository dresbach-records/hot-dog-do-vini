import React from 'react';
import '../../styles/components/cards.css';

const Card = ({ children, variant = 'glass', padding = '1.5rem', className = '', ...props }) => {
  const variantClass = `${variant}-panel`;
  
  return (
    <div 
      className={`${variantClass} ${className}`}
      style={{ padding }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
