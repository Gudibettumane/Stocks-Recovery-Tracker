import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, BarChart, Bar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { fetchStockData } from '../services/supabase';
import { formatDate, formatPercentage } from '../utils/formatters';
import '../styles/components/ComparisonTool.css';

const ComparisonTool = ({ recoveryMetrics, stockMetadata }) => {
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [availableStocks, setAvailableStocks] = useState([]);
  const [stocksData, setStocksData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('priceChart');

  // Line colors for charts
  const lineColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F'];

  // Initialize available stocks from recovery metrics
  useEffect(() => {
    if (recoveryMetrics && recoveryMetrics.length > 0) {
      const sortedStocks = [...recoveryMetrics].sort((a, b) => {
        return a.symbol.localeCompare(b.symbol);
      });
      setAvailableStocks(sortedStocks);
    }
  }, [recoveryMetrics]);

  // Fetch data for selected stocks
  useEffect(() => {
    const fetchSelectedStocksData = async () => {
      if (selectedStocks.length === 0) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const newStocksData = { ...stocksData };
        
        // Only fetch data for stocks that haven't been fetched yet
        const stocksToFetch = selectedStocks.filter(symbol => !stocksData[symbol]);
        
        for (const symbol of stocksToFetch) {
          const data = await fetchStockData(symbol);
          
          // Find metrics for this stock
          const metrics = recoveryMetrics.find(stock => stock.symbol === symbol);
          
          if (metrics) {
            // Process data for charts
            const processedData = data.map(item => ({
              ...item,
              date: formatDate(item.Date),
              percentageChange: ((item.Close - metrics.lowest_price) / metrics.lowest_price) * 100
            }));
            
            newStocksData[symbol] = {
              data: processedData,
              metrics
            };
          }
        }
        
        setStocksData(newStocksData);
      } catch (err) {
        setError('Failed to load stock data');
        console.error('Error fetching stock data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSelectedStocksData();
  }, [selectedStocks, recoveryMetrics, stocksData]);

  // Filtered available stocks based on search term
  const filteredStocks = useMemo(() => {
    if (!searchTerm) return availableStocks.slice(0, 50); // Limit initial display
    
    const term = searchTerm.toLowerCase();
    return availableStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(term) || 
      (stock.sector && stock.sector.toLowerCase().includes(term))
    );
  }, [availableStocks, searchTerm]);

  // Handle adding a stock to comparison
  const handleAddStock = (stock) => {
    if (selectedStocks.includes(stock.symbol)) return;
    if (selectedStocks.length >= 5) {
      alert('You can compare up to 5 stocks at a time');
      return;
    }
    setSelectedStocks([...selectedStocks, stock.symbol]);
  };

  // Handle removing a stock from comparison
  const handleRemoveStock = (symbol) => {
    setSelectedStocks(selectedStocks.filter(s => s !== symbol));
  };

  // Prepare data for price comparison chart
  const priceComparisonData = useMemo(() => {
    if (selectedStocks.length === 0) return [];
    
    // Find the earliest date common to all selected stocks
    const allDates = {};
    selectedStocks.forEach(symbol => {
      if (stocksData[symbol]) {
        stocksData[symbol].data.forEach(item => {
          if (!allDates[item.date]) {
            allDates[item.date] = 1;
          } else {
            allDates[item.date]++;
          }
        });
      }
    });
    
    const commonDates = Object.keys(allDates).filter(date => 
      allDates[date] === selectedStocks.filter(symbol => stocksData[symbol]).length
    ).sort();
    
    // Create chart data with price for each stock
    return commonDates.map(date => {
      const dataPoint = { date };
      selectedStocks.forEach(symbol => {
        if (stocksData[symbol]) {
          const point = stocksData[symbol].data.find(d => d.date === date);
          if (point) {
            dataPoint[symbol] = point.Close;
          }
        }
      });
      return dataPoint;
    });
  }, [selectedStocks, stocksData]);

  // Prepare data for bounce percentage comparison chart
  const bounceComparisonData = useMemo(() => {
    if (selectedStocks.length === 0) return [];
    
    // Find the earliest date common to all selected stocks
    const allDates = {};
    selectedStocks.forEach(symbol => {
      if (stocksData[symbol]) {
        stocksData[symbol].data.forEach(item => {
          if (!allDates[item.date]) {
            allDates[item.date] = 1;
          } else {
            allDates[item.date]++;
          }
        });
      }
    });
    
    const commonDates = Object.keys(allDates).filter(date => 
      allDates[date] === selectedStocks.filter(symbol => stocksData[symbol]).length
    ).sort();
    
    // Create chart data with bounce percentage for each stock
    return commonDates.map(date => {
      const dataPoint = { date };
      selectedStocks.forEach(symbol => {
        if (stocksData[symbol]) {
          const point = stocksData[symbol].data.find(d => d.date === date);
          if (point) {
            dataPoint[symbol] = point.percentageChange;
          }
        }
      });
      return dataPoint;
    });
  }, [selectedStocks, stocksData]);

  // Prepare radar chart data for comparing key metrics
  const metricsRadarData = useMemo(() => {
    if (selectedStocks.length === 0) return [];
    
    const metrics = ['bounce_percentage', 'recovery_strength', 'relative_sector_performance', 'volume_increase'];
    const metricLabels = {
      bounce_percentage: 'Bounce %',
      recovery_strength: 'Recovery Strength',
      relative_sector_performance: 'Vs Sector',
      volume_increase: 'Volume Increase'
    };
    
    // Get min/max values for each metric to normalize
    const ranges = {};
    metrics.forEach(metric => {
      ranges[metric] = {
        min: Infinity,
        max: -Infinity
      };
    });
    
    selectedStocks.forEach(symbol => {
      const stockMetrics = recoveryMetrics.find(stock => stock.symbol === symbol);
      if (stockMetrics) {
        metrics.forEach(metric => {
          if (stockMetrics[metric] !== undefined && stockMetrics[metric] !== null) {
            ranges[metric].min = Math.min(ranges[metric].min, stockMetrics[metric]);
            ranges[metric].max = Math.max(ranges[metric].max, stockMetrics[metric]);
          }
        });
      }
    });
    
    // Normalize metrics to 0-100 scale for radar chart
    return metrics.map(metric => {
      const dataPoint = { metric: metricLabels[metric] };
      
      selectedStocks.forEach(symbol => {
        const stockMetrics = recoveryMetrics.find(stock => stock.symbol === symbol);
        if (stockMetrics && stockMetrics[metric] !== undefined && stockMetrics[metric] !== null) {
          const range = ranges[metric].max - ranges[metric].min;
          if (range === 0) {
            dataPoint[symbol] = 50; // Avoid division by zero
          } else {
            dataPoint[symbol] = ((stockMetrics[metric] - ranges[metric].min) / range) * 100;
          }
        } else {
          dataPoint[symbol] = 0;
        }
      });
      
      return dataPoint;
    });
  }, [selectedStocks, recoveryMetrics]);

  // Comparison metrics table data
  const comparisonTableData = useMemo(() => {
    return selectedStocks.map(symbol => {
      const metrics = recoveryMetrics.find(stock => stock.symbol === symbol);
      if (!metrics) return null;
      
      return {
        symbol,
        sector: metrics.sector,
        marketCap: metrics.market_cap_category,
        bounce: metrics.bounce_percentage,
        current: metrics.current_price,
        lowest: metrics.lowest_price,
        lowestDate: metrics.lowest_date,
        daysToRecover: metrics.days_to_recover,
        volumeIncrease: metrics.volume_increase,
        recoveryStrength: metrics.recovery_strength,
        vsSector: metrics.relative_sector_performance
      };
    }).filter(Boolean);
  }, [selectedStocks, recoveryMetrics]);

  return (
    <div className="comparison-tool">
      <h1>Stock Comparison Tool</h1>
      
      <div className="comparison-layout">
        <div className="stock-selector">
          <h2>Select Stocks to Compare</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by symbol or sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="stock-list">
            {filteredStocks.length > 0 ? (
              filteredStocks.map(stock => (
                <div key={stock.symbol} className="stock-item">
                  <div className="stock-info">
                    <span className="stock-symbol">{stock.symbol}</span>
                    <span className="stock-sector">{stock.sector}</span>
                  </div>
                  <button 
                    className="add-button"
                    onClick={() => handleAddStock(stock)}
                    disabled={selectedStocks.includes(stock.symbol)}
                  >
                    {selectedStocks.includes(stock.symbol) ? 'Added' : 'Add'}
                  </button>
                </div>
              ))
            ) : (
              <div className="no-results">No stocks found</div>
            )}
          </div>
        </div>
        
        <div className="comparison-content">
          <div className="selected-stocks">
            <h2>Selected Stocks</h2>
            {selectedStocks.length > 0 ? (
              <div className="selected-chips">
                {selectedStocks.map((symbol, index) => (
                  <div 
                    key={symbol} 
                    className="selected-chip"
                    style={{ borderColor: lineColors[index % lineColors.length] }}
                  >
                    <span>{symbol}</span>
                    <button onClick={() => handleRemoveStock(symbol)}>×</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-selection">Select stocks to compare (up to 5)</div>
            )}
          </div>
          
          {loading && <div className="loading">Loading stock data...</div>}
          {error && <div className="error">{error}</div>}
          
          {selectedStocks.length > 0 && !loading && (
            <>
              <div className="tabs">
                <button 
                  className={activeTab === 'priceChart' ? 'active' : ''}
                  onClick={() => setActiveTab('priceChart')}
                >
                  Price Chart
                </button>
                <button 
                  className={activeTab === 'bounceChart' ? 'active' : ''}
                  onClick={() => setActiveTab('bounceChart')}
                >
                  Bounce % Chart
                </button>
                <button 
                  className={activeTab === 'radarChart' ? 'active' : ''}
                  onClick={() => setActiveTab('radarChart')}
                >
                  Metrics Comparison
                </button>
                <button 
                  className={activeTab === 'table' ? 'active' : ''}
                  onClick={() => setActiveTab('table')}
                >
                  Data Table
                </button>
              </div>
              
              <div className="chart-container">
                {activeTab === 'priceChart' && (
                  <>
                    <h3>Price Comparison</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={priceComparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          angle={-45} 
                          textAnchor="end" 
                          height={70}
                          interval={Math.ceil(priceComparisonData.length / 10)}
                        />
                        <YAxis label={{ value: 'Price (₹)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip 
                          formatter={(value, name) => [`₹${value.toFixed(2)}`, name]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />
                        {selectedStocks.map((symbol, index) => (
                          <Line 
                            key={symbol}
                            type="monotone"
                            dataKey={symbol}
                            stroke={lineColors[index % lineColors.length]}
                            activeDot={{ r: 8 }}
                            dot={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                )}
                
                {activeTab === 'bounceChart' && (
                  <>
                    <h3>Bounce Percentage Comparison</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={bounceComparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          angle={-45} 
                          textAnchor="end" 
                          height={70}
                          interval={Math.ceil(bounceComparisonData.length / 10)}
                        />
                        <YAxis label={{ value: 'Bounce %', angle: -90, position: 'insideLeft' }} />
                        <Tooltip 
                          formatter={(value, name) => [`${value.toFixed(2)}%`, name]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />
                        {selectedStocks.map((symbol, index) => (
                          <Line 
                            key={symbol}
                            type="monotone"
                            dataKey={symbol}
                            stroke={lineColors[index % lineColors.length]}
                            activeDot={{ r: 8 }}
                            dot={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                )}
                
                {activeTab === 'radarChart' && (
                  <>
                    <h3>Key Metrics Comparison</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart outerRadius={150} data={metricsRadarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        {selectedStocks.map((symbol, index) => (
                          <Radar 
                            key={symbol}
                            name={symbol}
                            dataKey={symbol}
                            stroke={lineColors[index % lineColors.length]}
                            fill={lineColors[index % lineColors.length]}
                            fillOpacity={0.2}
                          />
                        ))}
                        <Legend />
                        <Tooltip 
                          formatter={(value, name) => [`${value.toFixed(2)}`, name]}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </>
                )}
                
                {activeTab === 'table' && (
                  <>
                    <h3>Comparative Metrics</h3>
                    <div className="table-responsive">
                      <table className="comparison-table">
                        <thead>
                          <tr>
                            <th>Metric</th>
                            {selectedStocks.map((symbol, index) => (
                              <th 
                                key={symbol}
                                style={{ borderBottom: `3px solid ${lineColors[index % lineColors.length]}` }}
                              >
                                {symbol}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Sector</td>
                            {comparisonTableData.map(stock => (
                              <td key={`${stock.symbol}-sector`}>{stock.sector}</td>
                            ))}
                          </tr>
                          <tr>
                            <td>Market Cap</td>
                            {comparisonTableData.map(stock => (
                              <td key={`${stock.symbol}-mcap`}>{stock.marketCap}</td>
                            ))}
                          </tr>
                          <tr>
                            <td>Bounce %</td>
                            {comparisonTableData.map(stock => (
                              <td 
                                key={`${stock.symbol}-bounce`}
                                className={stock.bounce >= 0 ? "positive" : "negative"}
                              >
                                {stock.bounce.toFixed(2)}%
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td>Current Price (₹)</td>
                            {comparisonTableData.map(stock => (
                              <td key={`${stock.symbol}-current`}>{stock.current.toFixed(2)}</td>
                            ))}
                          </tr>
                          <tr>
                            <td>Lowest Price (₹)</td>
                            {comparisonTableData.map(stock => (
                              <td key={`${stock.symbol}-lowest`}>{stock.lowest.toFixed(2)}</td>
                            ))}
                          </tr>
                          <tr>
                            <td>Lowest Date</td>
                            {comparisonTableData.map(stock => (
                              <td key={`${stock.symbol}-date`}>{formatDate(stock.lowestDate)}</td>
                            ))}
                          </tr>
                          <tr>
                            <td>Days to 20% Recovery</td>
                            {comparisonTableData.map(stock => (
                              <td key={`${stock.symbol}-days`}>
                                {stock.daysToRecover !== null ? stock.daysToRecover : 'N/A'}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td>Volume Increase</td>
                            {comparisonTableData.map(stock => (
                              <td key={`${stock.symbol}-volume`}>
                                {stock.volumeIncrease ? stock.volumeIncrease.toFixed(2) : 'N/A'}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td>Recovery Strength</td>
                            {comparisonTableData.map(stock => (
                              <td key={`${stock.symbol}-strength`}>{stock.recoveryStrength.toFixed(2)}</td>
                            ))}
                          </tr>
                          <tr>
                            <td>vs Sector %</td>
                            {comparisonTableData.map(stock => (
                              <td 
                                key={`${stock.symbol}-sector-perf`}
                                className={stock.vsSector >= 0 ? "positive" : "negative"}
                              >
                                {stock.vsSector.toFixed(2)}%
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonTool;