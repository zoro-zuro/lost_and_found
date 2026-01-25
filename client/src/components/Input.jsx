import React from 'react';

const Input = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error = '', 
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
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`input-field rounded-[10px] h-[44px] items-center ${error ? '!border-danger !ring-danger/20' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-small text-danger">{error}</p>
      )}
    </div>
  );
};

export default Input;
