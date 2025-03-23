import React, { useMemo } from 'react';
import './SectorHeatmap.css';

const SectorHeatmap = ({ recoveryMetrics }) => {
  // Process sector data
  const sectorData = useMemo(() => {
    // Group stocks by sector and market cap
    const data = {};
    
    recoveryMetrics.forEach(stock => {
      const { sector, market_cap_category, bounce_percentage } = stock;
      
      if (!data[sector]) {
        data[sector] = {
          sector,
          'Large Cap': { total: 0, count: 0, avg: 0 },
          'Mid Cap': { total: 0, count: 0, avg: 0 },
          'Small Cap': { total: 0, count: 0, avg: 0 },
          overall: { total: 0, count: 0, avg: 0 }
        };
      }
      
      // Add to market cap category data
      if (data[sector][market_cap_category]) {
        data[sector][market_cap_category].total += bounce_percentage;
        data[sector][market_cap_category].count += 1;
      }
      
      // Add to overall sector data
      data[sector].overall.total += bounce_percentage;
      data[sector].overall.count += 1;
    });
    
    // Calculate averages
    Object.values(data).forEach(sector => {
      ['Large Cap', 'Mid Cap', 'Small Cap', 'overall'].forEach(category => {
        if (sector[category].count > 0) {
          sector[category].avg = sector[category].total / sector[category].count;
        }
      });
    });
    
    // Convert to array and sort by overall performance
    return Object.values(data)
      .sort((a, b) => b.overall.avg - a.overall.avg);
  }, [recoveryMetrics]);
  
  // Function to generate color based on bounce percentage
  const getBounceColor = (bouncePercentage) => {
    if (bouncePercentage === 0) return '#f0f0f0'; // No data
    
    // Color scale from red (negative) to green (positive)
    if (bouncePercentage < 0) {
      const intensity = Math.min(255, Math.abs(bouncePercentage) * 5);
      return `rgb(${intensity}, 0, 0)`;
    } else {
      const intensity = Math.min(255, bouncePercentage * 5);
      return `rgb(0, ${intensity}, 0)`;
    }
  };
  
  // Function to determine text color based on background
  const getTextColor = (bouncePercentage) => {
    const intensity = Math.abs(bouncePercentage) * 5;
    return intensity > 50 ? '#ffffff' : '#000000';
  };

  return (
    <div className="sector-heatmap">
      <table className="heatmap-table">
        <thead>
          <tr>
            <th>Sector</th>
            <th>Large Cap</th>
            <th>Mid Cap</th>
            <th>Small Cap</th>
            <th>Overall</th>
          </tr>
        </thead>
        <tbody>
          {sectorData.map(sector => (
            <tr key={sector.sector}>
              <td className="sector-name">{sector.sector}</td>
              
              {['Large Cap', 'Mid Cap', 'Small Cap', 'overall'].map(category => {
                const cell = sector[category];
                const hasData = cell.count > 0;
                
                return (
                  <td 
                    key={`${sector.sector}-${category}`}
                    className="heatmap-cell"
                    style={{
                      backgroundColor: hasData ? getBounceColor(cell.avg) : '#f0f0f0',
                      color: hasData ? getTextColor(cell.avg) : '#999'
                    }}
                  >
                    {hasData ? (
                      <>
                        <div className="cell-value">{cell.avg.toFixed(2)}%</div>
                        <div className="cell-count">({cell.count})</div>
                      </>
                    ) : (
                      'N/A'
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SectorHeatmap;