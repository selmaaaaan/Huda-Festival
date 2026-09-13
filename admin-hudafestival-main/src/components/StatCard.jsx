import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const StatCard = ({ icon: Icon, label, title, value, color = 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]', trend = "+0% from last week" }) => {
  const [isNumeric, setIsNumeric] = useState(false);
  const spring = useSpring(0, { bounce: 0, duration: 800 });
  const display = useTransform(spring, current => Math.round(current).toLocaleString());

  useEffect(() => {
    const strVal = String(value).replace(/,/g, '').replace('#', '');
    const num = Number(strVal);
    if (!isNaN(num) && strVal !== '') {
      setIsNumeric(true);
      spring.set(num);
    } else {
      setIsNumeric(false);
    }
  }, [value, spring]);

  const displayLabel = label || title;
  const isHexOrVar = color.startsWith('#') || color.startsWith('var');
  const iconClass = isHexOrVar ? '' : color;
  const iconStyle = isHexOrVar ? { backgroundColor: color, color: '#fff' } : undefined;
  
  let labelClass = 'text-[var(--color-text-heading)]';
  if (!isHexOrVar && color.includes('bg-')) {
    labelClass = color.replace('bg-', 'text-').split(' ')[0];
  }

  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-elevated)] rounded-2xl border border-[var(--color-border)] p-6 flex flex-col gap-4 relative overflow-hidden shadow-sm"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner z-10 ${iconClass}`} style={iconStyle}>
        <Icon size={24} />
      </div>
      <div className={`absolute top-4 right-4 opacity-[0.03] pointer-events-none z-0`}>
        <Icon size={80} />
      </div>
      <div className="z-10 mt-2">
        <p className={`text-sm font-bold ${labelClass}`}>{displayLabel}</p>
        <p className="text-4xl font-black text-[var(--color-text-heading)] mt-1 tracking-tight">
          {isNumeric && typeof value === 'string' && value.startsWith('#') ? '#' : ''}
          {isNumeric ? <motion.span>{display}</motion.span> : value}
        </p>
      </div>
    </motion.div>
  );
};

export default StatCard;
