import React, { useState } from 'react';

const FormSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  required = false, 
  error = '', 
  className = '',
  placeholder = 'Select an option',
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleSelect = (selectedValue) => {
    onChange({ target: { name, value: selectedValue } });
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => prev === -1 ? options.length - 1 : (prev - 1 + options.length) % options.length);
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      handleSelect(options[focusedIndex].value);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-slate-700 text-sm md:text-base font-semibold">
          {label}
          {required && <span className="text-orange-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`
            w-full
            h-14
            px-4 md:px-5
            rounded-xl md:rounded-2xl
            border border-gray-300
            bg-white
            text-gray-700
            text-sm md:text-base
            focus:border-indigo-500
            focus:outline-none
            focus:ring-2
            focus:ring-indigo-500
            focus:ring-opacity-20
            transition-colors
            cursor-pointer
            text-left
            flex items-center justify-between
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          `}
          {...props}
        >
          <span className={selectedOption ? 'text-gray-700' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          
          {/* Custom dropdown arrow */}
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </button>

        {/* Custom dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
            <div className="py-1 max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`
                    px-3 py-2 cursor-pointer text-sm
                    ${index === focusedIndex ? 'bg-indigo-100' : ''}
                    ${value === option.value ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}
                    ${index === 0 ? 'rounded-t-xl' : ''}
                    ${index === options.length - 1 ? 'rounded-b-xl' : ''}
                  `}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs md:text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormSelect;
