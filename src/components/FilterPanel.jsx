import React, { useState } from 'react';
import '../styles/components/FilterPanel.css';

const FilterPanel = ({ sectors, marketCapCategories, filters, onFilterChange }) => {
  const [expanded, setExpanded] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: Number(value) });
  };

  const handleReset = () => {
    onFilterChange({
      sector: 'all',
      marketCap: 'all',
      minBouncePercentage: 0,
      search: '',
    });
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`filter-panel ${expanded ? 'expanded' : ''}`}>
      <div className="filter-header" onClick={toggleExpand}>
        <h3>Filter Stocks</h3>
        <button className="expand-button">
          {expanded ? '−' : '+'}
        </button>
      </div>
      
      <div className="filter-content">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="search">Search:</label>
            <input
              type="text"
              id="search"
              name="search"
              placeholder="Symbol or sector..."
              value={filters.search}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="sector">Sector:</label>
            <select
              id="sector"
              name="sector"
              value={filters.sector}
              onChange={handleInputChange}
            >
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector === 'all' ? 'All Sectors' : sector}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="marketCap">Market Cap:</label>
            <select
              id="marketCap"
              name="marketCap"
              value={filters.marketCap}
              onChange={handleInputChange}
            >
              {marketCapCategories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Market Caps' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="filter-row">
          <div className="filter-group slider-group">
            <label htmlFor="minBouncePercentage">
              Min Bounce Percentage: {filters.minBouncePercentage}%
            </label>
            <input
              type="range"
              id="minBouncePercentage"
              name="minBouncePercentage"
              min="0"
              max="100"
              step="5"
              value={filters.minBouncePercentage}
              onChange={handleSliderChange}
            />
          </div>
          
          <div className="filter-group">
            <button className="reset-button" onClick={handleReset}>
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;