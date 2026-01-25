import React from 'react';

const Card = ({ children, className = '', hover = false }) => {
  const baseClasses = 'card-base';
  const hoverClasses = hover ? 'hover:border-primary/20 transition-all duration-300' : '';
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
