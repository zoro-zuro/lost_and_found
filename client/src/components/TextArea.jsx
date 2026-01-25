import React from 'react';

const TextArea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error = '', 
  rows = 4,
  className = '',
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={name} className="text-label text-text flex items-center gap-1">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`textarea-field resize-none ${error ? '!border-danger !ring-danger/20' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-small text-danger">{error}</p>
      )}
    </div>
  );
};

export default TextArea;
