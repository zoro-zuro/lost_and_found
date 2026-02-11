import React from 'react';

const PageHeader = ({ title, subtitle, children, className = '', ...props }) => {
  return (
    <div className={`mb-8 ${className}`} {...props}>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
      {subtitle && (
        <p className="text-slate-600">{subtitle}</p>
      )}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
