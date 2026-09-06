import React from 'react';

const Logo = ({ size = 'default' }) => {
  const sizes = {
    small: { grid: 'w-6 h-6', square: 'w-[11px] h-[11px]', text: 'text-base' },
    default: { grid: 'w-8 h-8', square: 'w-[15px] h-[15px]', text: 'text-xl' },
    large: { grid: 'w-10 h-10', square: 'w-[19px] h-[19px]', text: 'text-2xl' },
  };

  const s = sizes[size] || sizes.default;

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${s.grid} grid grid-cols-2 gap-[3px]`}>
        <div className={`${s.square} rounded-sm bg-[#3B82F6]`} />
        <div className={`${s.square} rounded-sm bg-[#E44E49]`} />
        <div className={`${s.square} rounded-sm bg-[#FFCF28]`} />
        <div className={`${s.square} rounded-sm bg-[#22C55E]`} />
      </div>
      <span className={`${s.text} font-extrabold tracking-tight text-[var(--color-text-heading)]`}>
        HUDA
      </span>
    </div>
  );
};

export default Logo;
