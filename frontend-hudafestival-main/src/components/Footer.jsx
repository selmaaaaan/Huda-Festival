import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[var(--color-public-bg)] mt-12 py-8 border-t border-[var(--color-border)]">
      <div className="container mx-auto text-center text-sm text-[var(--color-text-body)]">
        © {new Date().getFullYear()} Huda Festival. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;