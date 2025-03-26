import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/components/Navbar.css';
import { supabase } from '../services/supabase';
import { formatDate } from '../utils/formatters';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const location = useLocation();

  // Handle scroll event to add shadow to navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fetch last updated date from database
  useEffect(() => {
    async function fetchLastUpdated() {
      try {
        // Query the stock_data table for the most recent date
        const { data, error } = await supabase
          .from('stock_data')
          .select('Date')
          .order('Date', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('Error fetching last updated date:', error);
          return;
        }
        
        if (data && data.length > 0) {
          setLastUpdated(data[0].Date);
        }
      } catch (err) {
        console.error('Error in last updated fetch:', err);
      }
    }
    
    fetchLastUpdated();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Format date for display
  const formattedDate = lastUpdated ? formatDate(lastUpdated) : 'Loading...';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">📈</span>
          <span className="logo-text">Indian Market Recovery Tracker</span>
        </Link>

        <div className="navbar-mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          <span className={`menu-icon ${isOpen ? 'open' : ''}`}></span>
        </div>

        <ul className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <Link 
              to="/" 
              className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/sector-analysis" 
              className={`navbar-link ${location.pathname === '/sector-analysis' ? 'active' : ''}`}
            >
              Sector Analysis
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/comparison" 
              className={`navbar-link ${location.pathname === '/comparison' ? 'active' : ''}`}
            >
              Stock Comparison
            </Link>
          </li>
          <li className="navbar-item info-item">
            <div className="market-info">
              <div className="info-label">Last Updated</div>
              <div className="info-value">{formattedDate}</div>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;