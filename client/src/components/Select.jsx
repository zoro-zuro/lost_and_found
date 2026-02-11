import React from 'react';
import ReactSelect from 'react-select';

const Select = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  required = false, 
  error = '', 
  className = '',
  placeholder = 'Select an option',
  isMulti = false,
  ...props 
}) => {
  // Handle conversion from raw value to object for ReactSelect
  const selectedOption = isMulti 
    ? options.filter(opt => Array.isArray(value) && value.includes(opt.value))
    : options.find(opt => opt.value === value) || null;

  const handleChange = (selected) => {
    if (isMulti) {
      onChange({ target: { name, value: selected ? selected.map(s => s.value) : [] } });
    } else {
      onChange({ target: { name, value: selected ? selected.value : '' } });
    }
  };

  const customStyles = {
    control: (base, state) => {
      const baseStyle = {
        ...base,
        minHeight: '44px',
        height: '44px',
        borderRadius: '12px',
        borderColor: error ? '#dc2626' : 'rgba(15, 23, 42, 0.1)',
        backgroundColor: 'white',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(37, 99, 235, 0.1)' : 'none',
        '&:hover': {
          borderColor: error ? '#dc2626' : 'rgba(15, 23, 42, 0.2)'
        },
        transition: 'all 0.2s ease',
        width: '100%'
      };
      return props.styles?.control ? props.styles.control(baseStyle, state) : baseStyle;
    },
    valueContainer: (base, state) => {
      const baseStyle = {
        ...base,
        padding: '0 16px',
        height: '44px',
        display: 'flex',
        alignItems: 'center'
      };
      return props.styles?.valueContainer ? props.styles.valueContainer(baseStyle, state) : baseStyle;
    },
    placeholder: (base, state) => {
      const baseStyle = {
        ...base,
        color: '#94a3b8',
        fontSize: '14px'
      };
      return props.styles?.placeholder ? props.styles.placeholder(baseStyle, state) : baseStyle;
    },
    dropdownIndicator: (base, state) => {
      const baseStyle = {
        ...base,
        padding: '0 8px'
      };
      return props.styles?.dropdownIndicator ? props.styles.dropdownIndicator(baseStyle, state) : baseStyle;
    },
    indicatorSeparator: (base, state) => {
      const baseStyle = {
        ...base,
      };
      return props.styles?.indicatorSeparator ? props.styles.indicatorSeparator(baseStyle, state) : baseStyle;
    },
    singleValue: (base, state) => {
      const baseStyle = {
        ...base,
      };
      return props.styles?.singleValue ? props.styles.singleValue(baseStyle, state) : baseStyle;
    },
    menu: (base, state) => {
      const baseStyle = {
        ...base,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        border: '1px solid rgba(15, 23, 42, 0.05)',
        padding: '4px',
        zIndex: 999
      };
      return props.styles?.menu ? props.styles.menu(baseStyle, state) : baseStyle;
    },
    menuPortal: (base) => ({ ...base, zIndex: 999 }),
    option: (base, state) => {
      const baseStyle = {
        ...base,
        borderRadius: '8px',
        margin: '2px 0',
        backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
        color: state.isSelected ? 'white' : '#0f172a',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        '&:active': {
          backgroundColor: '#2563eb',
          color: 'white'
        }
      };
      return props.styles?.option ? props.styles.option(baseStyle, state) : baseStyle;
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-label text-text flex items-center gap-1">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      <ReactSelect
        id={name}
        name={name}
        value={selectedOption}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        isMulti={isMulti}
        styles={customStyles}
        menuPortalTarget={document.body}
        classNamePrefix="react-select"
        {...props}
      />
      {error && (
        <p className="text-small text-danger">{error}</p>
      )}
    </div>
  );
};

export default Select;
