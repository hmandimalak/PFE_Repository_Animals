import React from 'react';

const Button = ({ onClick, children, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
