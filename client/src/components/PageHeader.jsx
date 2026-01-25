import React from 'react';

const PageHeader = ({ title, subtitle, action }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div className="space-y-4">
        <h1 className="text-display text-text">{title}</h1>
        {/* {subtitle && <p className="text-body text-muted-text max-w-2xl">{subtitle}</p>} */}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
