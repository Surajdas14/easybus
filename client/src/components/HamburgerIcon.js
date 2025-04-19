import React from 'react';
import './HamburgerIcon.css';

const HamburgerIcon = ({ isOpen, toggleMenu }) => (
  <button
    className={`hamburger-icon ${isOpen ? 'open' : ''}`}
    aria-label="Toggle menu"
    aria-expanded={isOpen}
    onClick={toggleMenu}
    type="button"
  >
    <span className="bar top"></span>
    <span className="bar middle"></span>
    <span className="bar bottom"></span>
  </button>
);

export default HamburgerIcon;
