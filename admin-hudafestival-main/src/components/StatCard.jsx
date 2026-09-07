import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color = 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' }) => {
  const [isNumeric, setIsNumeric] = useState(false);
  const spring = useSpring(0, { bounce: 0, duration: 800 });
  const display = useTransform(spring, current => Math.round(current).toLocaleString());

  useEffect(() => {
    const strVal = String(value).replace(/,/g, '');
    const num = Number(strVal);
    if (!isNaN(num) && strVal !== '') {
      setIsNumeric(true);
      spring.set(num);
    } else {
      setIsNumeric(false);
    }
  }, [value, spring]);

  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)] p-5 flex items-center gap-4 hover:shadow-lg hover:shadow-black/5"
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--color-text-heading)]">
          {isNumeric ? <motion.span>{display}</motion.span> : value}
        </p>
        <p className="text-sm text-[var(--color-text-body)]">{label}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;
