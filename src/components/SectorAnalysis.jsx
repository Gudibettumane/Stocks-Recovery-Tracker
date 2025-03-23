import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line,
  Treemap, Scatter, ScatterChart, ZAxis
} from 'recharts';
import { Link } from 'react-router-dom';
import '../styles/components/SectorAnalysis.css';

const SectorAnalysis = ({ recoveryMetrics }) => {
  const [selectedSector, setSelectedSector] = useState('all');
  const [chartType, setChartType] = useState('barChart');

  // Get all unique sectors
  const sectors = useMemo(() => {
    const uniqueSectors = new Set(recoveryMetrics.map(stock => stock.sector));
    return ['all', ...Array.from(uniqueSectors)];
  }, [recoveryMetrics]);

  // Process sector performance data
  const sectorPerformance = useMemo(() => {
    const sectorData = {};
    
    recoveryMetrics.forEach(stock => {
      if (!sectorData[stock.sector]) {
        sectorData[stock.sector] = {
          sector: stock.sector,
          totalBounce: 0,
          totalRecoveryStrength: 0,
          totalVolumeIncrease: 0,
          totalDaysToRecover: 0,
          stocksWithDaysData: 0,
          stocksWithVolumeData: 0,
          count: 0,
          stocks: []
        };
      }
      
      sectorData[stock.sector].totalBounce += stock.bounce_percentage;
      sectorData[stock.sector].totalRecoveryStrength += stock.recovery_strength;
      
      if (stock.volume_increase) {
        sectorData[stock.sector].totalVolumeIncrease += stock.volume_increase;
        sectorData[stock.sector].stocksWithVolumeData += 1;
      }
      
      if (stock.days_to_recover !== null) {
        sectorData[stock.sector].totalDaysToRecover += stock.days_to_recover;
        sectorData[stock.sector].stocksWithDaysData += 1;
      }
      
      sectorData[stock.sector].count += 1;
      sectorData[stock.sector].stocks.push(stock);
    });
    
    // Calculate averages and transform to array
    return Object.values(sectorData).map(sector => ({
      ...sector,
      avgBounce: sector.totalBounce / sector.count,
      avgRecoveryStrength: sector.totalRecoveryStrength / sector.count,
      avgVolumeIncrease: sector.stocksWithVolumeData > 0 ? 
        sector.totalVolumeIncrease / sector.stocksWithVolumeData : 0,
      avgDaysToRecover: sector.stocksWithDaysData > 0 ? 
        sector.totalDaysToRecover / sector.stocksWithDaysData : 0,
    })).sort((a, b) => b.avgBounce - a.avgBounce);
  }, [recoveryMetrics]);
  
  // Market cap distribution by sector
  const marketCapDistribution = useMemo(() => {
    const distribution = {};
    
    recoveryMetrics.forEach(stock => {
      if (!distribution[stock.sector]) {
        distribution[stock.sector] = {
          sector: stock.sector,
          'Large Cap': 0,
          'Mid Cap': 0,
          'Small Cap': 0,
          total: 0
        };
      }
      
      distribution[stock.sector][stock.market_cap_category] += 1;
      distribution[stock.sector].total += 1;
    });
    
    return Object.values(distribution).map(item => ({
      ...item,
      'Large Cap %': (item['Large Cap'] / item.total) * 100,
      'Mid Cap %': (item['Mid Cap'] / item.total) * 100,
      'Small Cap %': (item['Small Cap'] / item.total) * 100,
    }));
  }, [recoveryMetrics]);
  
  // Bounce vs Recovery Speed scatter data
  const bounceVsRecoveryData = useMemo(() => {
    return sectorPerformance.map(sector => ({
      name: sector.sector,
      bounce: sector.avgBounce,
      recovery: sector.avgDaysToRecover,
      strength: sector.avgRecoveryStrength,
      stockCount: sector.count,
    }));
  }, [sectorPerformance]);
  
  // Treemap data for sector visualization
  const treemapData = useMemo(() => {
    return {
      name: 'Sectors',
      children: sectorPerformance.map(sector => ({
        name: sector.sector,
        size: sector.count,
        value: sector.avgBounce
      }))
    };
  }, [sectorPerformance]);
  
  // Filter stocks by selected sector
  const filteredStocks = useMemo(() => {
    if (selectedSector === 'all') {
      return recoveryMetrics;
    }
    return recoveryMetrics.filter(stock => stock.sector === selectedSector);
  }, [recoveryMetrics, selectedSector]);
  
  // Top and bottom performers in selected sector or all sectors
  const topPerformers = useMemo(() => {
    return [...filteredStocks]
      .sort((a, b) => b.bounce_percentage - a.bounce_percentage)
      .slice(0, 5);
  }, [filteredStocks]);
  
  const bottomPerformers = useMemo(() => {
    return [...filteredStocks]
      .sort((a, b) => a.bounce_percentage - b.bounce_percentage)
      .slice(0, 5);
  }, [filteredStocks]);

  // Custom colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Custom tooltip for bar charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${label}`}</p>
          <p className="value">{`${payload[0].name}: ${payload[0].value.toFixed(2)}`}</p>
          <p className="stocks">{`Number of Stocks: ${payload[0].payload.count}`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="sector-analysis">
      <h1>Sector Analysis</h1>
      
      <div className="sector-controls">
        <div className="control-group">
          <label htmlFor="sector-select">Select Sector:</label>
          <select 
            id="sector-select" 
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
          >
            {sectors.map(sector => (
              <option key={sector} value={sector}>
                {sector === 'all' ? 'All Sectors' : sector}
              </option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="chart-type">Chart Type:</label>
          <select 
            id="chart-type" 
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="barChart">Bar Chart</option>
            <option value="pieChart">Pie Chart</option>
            <option value="treemap">Treemap</option>
            <option value="scatterPlot">Scatter Plot</option>
          </select>
        </div>
      </div>
      
      <div className="chart-section">
        <h2>
          {selectedSector === 'all' 
            ? 'Sector Performance Comparison' 
            : `${selectedSector} Sector Performance`}
        </h2>
        
        {chartType === 'barChart' && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={selectedSector === 'all' 
                  ? sectorPerformance 
                  : marketCapDistribution.filter(item => item.sector === selectedSector)
                }
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="sector" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  interval={0}
                />
                <YAxis label={{ value: 'Avg. Bounce %', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey={selectedSector === 'all' ? "avgBounce" : "Large Cap %"} 
                  name={selectedSector === 'all' ? "Avg. Bounce %" : "Large Cap %"}
                  fill="#0088FE" 
                />
                {selectedSector !== 'all' && (
                  <>
                    <Bar dataKey="Mid Cap %" name="Mid Cap %" fill="#00C49F" />
                    <Bar dataKey="Small Cap %" name="Small Cap %" fill="#FFBB28" />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {chartType === 'pieChart' && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={selectedSector === 'all' 
                    ? sectorPerformance.map(sector => ({
                        name: sector.sector,
                        value: sector.count
                      }))
                    : [
                        { name: 'Large Cap', value: marketCapDistribution.find(item => item.sector === selectedSector)?.['Large Cap'] || 0 },
                        { name: 'Mid Cap', value: marketCapDistribution.find(item => item.sector === selectedSector)?.['Mid Cap'] || 0 },
                        { name: 'Small Cap', value: marketCapDistribution.find(item => item.sector === selectedSector)?.['Small Cap'] || 0 }
                      ]
                  }
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {selectedSector === 'all' 
                    ? sectorPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))
                    : [0, 1, 2].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))
                  }
                </Pie>
                <Tooltip formatter={(value) => [`${value} stocks`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {chartType === 'treemap' && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <Treemap
                data={treemapData.children}
                dataKey="value"
                aspectRatio={4/3}
                stroke="#fff"
                fill="#8884d8"
                nameKey="name"
              >
                {
                  treemapData.children.map((item, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))
                }
              </Treemap>
            </ResponsiveContainer>
            <div className="chart-legend">
              <p>Box size: Number of stocks, Color intensity: Avg. Bounce %</p>
            </div>
          </div>
        )}
        
        {chartType === 'scatterPlot' && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid />
                <XAxis 
                  type="number" 
                  dataKey="bounce" 
                  name="Avg. Bounce %" 
                  label={{ value: 'Avg. Bounce %', position: 'insideBottomRight', offset: -5 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="recovery" 
                  name="Avg. Days to Recover" 
                  label={{ value: 'Avg. Days to Recover', angle: -90, position: 'insideLeft' }}
                />
                <ZAxis 
                  type="number" 
                  dataKey="stockCount" 
                  range={[50, 400]} 
                  name="Number of Stocks" 
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name) => {
                    if (name === 'Avg. Bounce %') return [`${value.toFixed(2)}%`, name];
                    if (name === 'Avg. Days to Recover') return [`${value.toFixed(1)} days`, name];
                    if (name === 'Number of Stocks') return [value, name];
                    return [value, name];
                  }}
                />
                <Legend />
                <Scatter 
                  name="Sectors" 
                  data={bounceVsRecoveryData} 
                  fill="#8884d8"
                >
                  {bounceVsRecoveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              <p>Bubble size represents number of stocks in sector</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="metrics-section">
        <h2>Key Sector Metrics</h2>
        <div className="metrics-grid">
          {selectedSector === 'all' ? (
            <div className="metrics-table-container">
              <table className="metrics-table">
                <thead>
                  <tr>
                    <th>Sector</th>
                    <th>Stocks</th>
                    <th>Avg. Bounce %</th>
                    <th>Avg. Recovery Days</th>
                    <th>Avg. Volume Increase</th>
                    <th>Avg. Recovery Strength</th>
                  </tr>
                </thead>
                <tbody>
                  {sectorPerformance.map(sector => (
                    <tr key={sector.sector}>
                      <td>
                        <button 
                          className="sector-link"
                          onClick={() => setSelectedSector(sector.sector)}
                        >
                          {sector.sector}
                        </button>
                      </td>
                      <td>{sector.count}</td>
                      <td className={sector.avgBounce >= 0 ? "positive" : "negative"}>
                        {sector.avgBounce.toFixed(2)}%
                      </td>
                      <td>{sector.avgDaysToRecover.toFixed(1)}</td>
                      <td>{sector.avgVolumeIncrease.toFixed(2)}x</td>
                      <td>{sector.avgRecoveryStrength.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="sector-detail">
              <div className="sector-header">
                <h3>{selectedSector}</h3>
                <button 
                  className="back-button"
                  onClick={() => setSelectedSector('all')}
                >
                  Back to All Sectors
                </button>
              </div>
              
              <div className="sector-stats">
                <div className="stat-card">
                  <h4>Number of Stocks</h4>
                  <p className="stat-value">
                    {sectorPerformance.find(s => s.sector === selectedSector)?.count || 0}
                  </p>
                </div>
                <div className="stat-card">
                  <h4>Average Bounce %</h4>
                  <p className={`stat-value ${
                    (sectorPerformance.find(s => s.sector === selectedSector)?.avgBounce || 0) >= 0 
                      ? "positive" 
                      : "negative"
                  }`}>
                    {(sectorPerformance.find(s => s.sector === selectedSector)?.avgBounce || 0).toFixed(2)}%
                  </p>
                </div>
                <div className="stat-card">
                  <h4>Avg. Days to 20% Recovery</h4>
                  <p className="stat-value">
                    {(sectorPerformance.find(s => s.sector === selectedSector)?.avgDaysToRecover || 0).toFixed(1)}
                  </p>
                </div>
                <div className="stat-card">
                  <h4>Avg. Volume Increase</h4>
                  <p className="stat-value">
                    {(sectorPerformance.find(s => s.sector === selectedSector)?.avgVolumeIncrease || 0).toFixed(2)}x
                  </p>
                </div>
              </div>
              
              <div className="top-performers">
                <div className="performers-section">
                  <h4>Top Performers</h4>
                  <table className="performers-table">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Bounce %</th>
                        <th>Recovery Strength</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPerformers.map(stock => (
                        <tr key={stock.symbol}>
                          <td>
                            <Link to={`/stock/${stock.symbol}`}>{stock.symbol}</Link>
                          </td>
                          <td className="positive">{stock.bounce_percentage.toFixed(2)}%</td>
                          <td>{stock.recovery_strength.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="performers-section">
                  <h4>Bottom Performers</h4>
                  <table className="performers-table">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Bounce %</th>
                        <th>Recovery Strength</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bottomPerformers.map(stock => (
                        <tr key={stock.symbol}>
                          <td>
                            <Link to={`/stock/${stock.symbol}`}>{stock.symbol}</Link>
                          </td>
                          <td className={stock.bounce_percentage >= 0 ? "positive" : "negative"}>
                            {stock.bounce_percentage.toFixed(2)}%
                          </td>
                          <td>{stock.recovery_strength.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="market-cap-distribution">
                <h4>Market Cap Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[
                      {
                        name: 'Large Cap',
                        value: marketCapDistribution.find(item => item.sector === selectedSector)?.['Large Cap %'] || 0
                      },
                      {
                        name: 'Mid Cap',
                        value: marketCapDistribution.find(item => item.sector === selectedSector)?.['Mid Cap %'] || 0
                      },
                      {
                        name: 'Small Cap',
                        value: marketCapDistribution.find(item => item.sector === selectedSector)?.['Small Cap %'] || 0
                      }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Percentage']} />
                    <Bar dataKey="value" fill="#8884d8">
                      <Cell fill="#0088FE" />
                      <Cell fill="#00C49F" />
                      <Cell fill="#FFBB28" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {selectedSector === 'all' && (
        <div className="overall-summary">
          <h2>Sector Recovery Summary</h2>
          <p>
            Overall, the {sectorPerformance[0]?.sector || ''} sector has shown the strongest recovery with an average bounce of 
            {' '}{(sectorPerformance[0]?.avgBounce || 0).toFixed(2)}%, followed by 
            {' '}{sectorPerformance[1]?.sector || ''} ({(sectorPerformance[1]?.avgBounce || 0).toFixed(2)}%) and 
            {' '}{sectorPerformance[2]?.sector || ''} ({(sectorPerformance[2]?.avgBounce || 0).toFixed(2)}%).
          </p>
          <p>
            The sectors with the slowest recovery rates are 
            {' '}{sectorPerformance[sectorPerformance.length - 1]?.sector || ''} ({(sectorPerformance[sectorPerformance.length - 1]?.avgBounce || 0).toFixed(2)}%), 
            {' '}{sectorPerformance[sectorPerformance.length - 2]?.sector || ''} ({(sectorPerformance[sectorPerformance.length - 2]?.avgBounce || 0).toFixed(2)}%), and 
            {' '}{sectorPerformance[sectorPerformance.length - 3]?.sector || ''} ({(sectorPerformance[sectorPerformance.length - 3]?.avgBounce || 0).toFixed(2)}%).
          </p>
        </div>
      )}
    </div>
  );
};

export default SectorAnalysis;