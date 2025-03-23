// Generate color for bounce percentage
export const getBounceColor = (bouncePercentage) => {
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
  
  // Get contrasting text color for a background color
  export const getTextColor = (backgroundColor) => {
    // Use a simple algorithm to determine if the background is dark
    const intensity = Math.abs(bouncePercentage) * 5;
    return intensity > 50 ? '#ffffff' : '#000000';
  };