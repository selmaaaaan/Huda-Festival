import React from 'react';

const Logo = ({ size = 'default', short = false }) => {
  // If it's the collapsed sidebar version, make it a fixed small box that doesn't overflow.
  // Using object-contain ensures the entire badge is visible within a small icon-sized square.
  if (short) {
    return (
      <div className="flex items-center justify-center shrink-0 w-14 h-14 overflow-hidden">
        <img 
          src="https://i.ibb.co/HTNc8VJN/lintervention-logo-badge-1.png" 
          alt="L'intervention" 
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  const sizeClasses = {
    small: 'h-8',
    default: 'h-20', // Larger for normal sidebar
    large: 'h-28 max-w-full', // For login page
  };

  const hClass = sizeClasses[size] || sizeClasses.default;

  return (
    <div className={`flex items-center justify-center ${size === 'large' ? 'w-full mb-2' : ''}`}>
      <img 
        src="https://i.ibb.co/HTNc8VJN/lintervention-logo-badge-1.png" 
        alt="L'intervention Logo" 
        className={`${hClass} w-auto object-contain drop-shadow-sm`}
      />
    </div>
  );
};

export default Logo;
