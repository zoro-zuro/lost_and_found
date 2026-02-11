import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
