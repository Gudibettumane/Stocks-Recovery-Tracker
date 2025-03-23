import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import StockTable from './StockTable';
import SectorHeatmap from './SectorHeatmap';
import FilterPanel from './FilterPanel';
import './Dashboard.css';

const Dashboard = ({ recoveryMetrics, stockMetadata }) => {
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [filters, setFilters] = useState({
    sector: 'all',
    marketCap: 'all',
    minBouncePercentage: 0,
    search: '',
  });

  // Top performing stocks
  const topPerformers = useMemo(() => {
    return [...recoveryMetrics]
      .sort((a, b) => b.bounce_percentage - a.bounce_percentage)
      .slice(0, 10);
  }, [recoveryMetrics]);

  // Sector performance data
  const sectorPerformance = useMemo(() => {
    const sectorData = {};
    recoveryMetrics.forEach(stock => {
      if (!sectorData[stock.sector]) {
        sectorData[stock.sector] = {
          sector: stock.sector,
          avgBounce: 0,
          count: 0,
          totalBounce: 0,
        };
      }
      sectorData[stock.sector].totalBounce += stock.bounce_percentage;
      sectorData[stock.sector].count += 1;
    });

    return Object.values(sectorData).map(item => ({
      ...item,
      avgBounce: item.totalBounce / item.count,
    })).sort((a, b) => b.avgBounce - a.avgBounce);
  }, [recoveryMetrics]);

  // Market cap performance data
  const marketCapPerformance = useMemo(() => {
    const marketCapData = {};
    recoveryMetrics.forEach(stock => {
      if (!marketCapData[stock.market_cap_category]) {
        marketCapData[stock.market_cap_category] = {
          category: stock.market_cap_category,
          avgBounce: 0,
          count: 0,
          totalBounce: 0,
        };
      }
      marketCapData[stock.market_cap_category].totalBounce += stock.bounce_percentage;
      marketCapData[stock.market_cap_category].count += 1;
    });

    return Object.values(marketCapData).map(item => ({
      ...item,
      avgBounce: item.totalBounce / item.count,
    })).sort((a, b) => b.avgBounce - a.avgBounce);
  }, [recoveryMetrics]);

  // Apply filters
  useEffect(() => {
    let result = [...recoveryMetrics];
    
    if (filters.sector !== 'all') {
      result = result.filter(stock => stock.sector === filters.sector);
    }
    
    if (filters.marketCap !== 'all') {
      result = result.filter(stock => stock.market_cap_category === filters.marketCap);
    }
    
    if (filters.minBouncePercentage > 0) {
      result = result.filter(stock => stock.bounce_percentage >= filters.minBouncePercentage);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(stock => 
        stock.symbol.toLowerCase().includes(searchLower) ||
        stock.sector.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredStocks(result);
  }, [recoveryMetrics, filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Get unique sectors for filter dropdown
  const sectors = useMemo(() => {
    const uniqueSectors = new Set(recoveryMetrics.map(stock => stock.sector));
    return ['all', ...Array.from(uniqueSectors)];
  }, [recoveryMetrics]);

  // Get unique market cap categories for filter dropdown
  const marketCapCategories = useMemo(() => {
    const uniqueCategories = new Set(recoveryMetrics.map(stock => stock.market_cap_category));
    return ['all', ...Array.from(uniqueCategories)];
  }, [recoveryMetrics]);

  return (
    <div className="dashboard">
      <h1>Indian Market Recovery Tracker</h1>
      
      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Average Bounce</h3>
          <p className="highlight-number">
            {(recoveryMetrics.reduce((sum, stock) => sum + stock.bounce_percentage, 0) / recoveryMetrics.length).toFixed(2)}%
          </p>
        </div>
        <div className="summary-card">
          <h3>Stocks Analyzed</h3>
          <p className="highlight-number">{recoveryMetrics.length}</p>
        </div>
        <div className="summary-card">
          <h3>Top Performer</h3>
          <p className="highlight-number">
            {topPerformers[0]?.symbol} ({topPerformers[0]?.bounce_percentage.toFixed(2)}%)
          </p>
        </div>
        <div className="summary-card">
          <h3>Best Sector</h3>
          <p className="highlight-number">
            {sectorPerformance[0]?.sector} ({sectorPerformance[0]?.avgBounce.toFixed(2)}%)
          </p>
        </div>
      </div>
      
      <div className="dashboard-charts">
        <div className="chart-container">
          <h2>Top 10 Performers</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topPerformers}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="symbol" 
                angle={-45} 
                textAnchor="end" 
                height={70} 
              />
              <YAxis label={{ value: 'Bounce %', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Bounce']} />
              <Bar dataKey="bounce_percentage" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container">
          <h2>Sector Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={sectorPerformance}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="sector" 
                angle={-45} 
                textAnchor="end" 
                height={70} 
              />
              <YAxis label={{ value: 'Avg. Bounce %', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Avg Bounce']} />
              <Bar dataKey="avgBounce" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container">
          <h2>Market Cap Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={marketCapPerformance}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis label={{ value: 'Avg. Bounce %', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Avg Bounce']} />
              <Bar dataKey="avgBounce" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container full-width">
          <h2>Sector Heatmap</h2>
          <SectorHeatmap recoveryMetrics={recoveryMetrics} />
        </div>
      </div>
      
      <div className="dashboard-filters">
        <h2>Stock Recovery Analysis</h2>
        <FilterPanel 
          sectors={sectors}
          marketCapCategories={marketCapCategories}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>
      
      <div className="dashboard-table">
        <StockTable 
          stocks={filteredStocks.length > 0 ? filteredStocks : recoveryMetrics} 
        />
      </div>
      
      <div className="dashboard-links">
        <Link to="/sector-analysis" className="dashboard-link">
          Detailed Sector Analysis →
        </Link>
        <Link to="/comparison" className="dashboard-link">
          Stock Comparison Tool →
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;