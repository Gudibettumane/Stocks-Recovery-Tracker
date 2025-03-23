/**
 * Generates a color for bounce percentage visualization
 * @param {number} bouncePercentage - The bounce percentage value
 * @returns {string} - RGB color in format 'rgb(r, g, b)'
 */
export const getBounceColor = (bouncePercentage) => {
  if (bouncePercentage === null || bouncePercentage === undefined) return '#f0f0f0'; // No data
  
  // Color scale from red (negative) to green (positive)
  if (bouncePercentage < 0) {
    const intensity = Math.min(255, Math.abs(bouncePercentage) * 5);
    return `rgb(${intensity}, 0, 0)`;
  } else {
    const intensity = Math.min(255, bouncePercentage * 5);
    return `rgb(0, ${intensity}, 0)`;
  }
};

/**
 * Calculate contrast ratio between colors
 * Based on WCAG 2.0 formula
 * @param {string} backgroundColor - The background color in RGB format
 * @returns {string} - Either black or white depending on which has better contrast
 */
export const getTextColor = (backgroundColor) => {
  // Parse RGB values from the background color
  const rgbMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  
  if (!rgbMatch) return '#000000'; // Default to black if format doesn't match
  
  const r = parseInt(rgbMatch[1], 10);
  const g = parseInt(rgbMatch[2], 10);
  const b = parseInt(rgbMatch[3], 10);
  
  // Calculate relative luminance using WCAG formula
  // https://www.w3.org/TR/WCAG20-TECHS/G17.html
  const toLinear = (c) => {
    const srgb = c / 255;
    return srgb <= 0.03928
      ? srgb / 12.92
      : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };
  
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  
  // Return white for dark backgrounds and black for light backgrounds
  return luminance > 0.179 ? '#000000' : '#ffffff';
};

/**
 * Generates a color for a percentage value in a heatmap
 * @param {number} percentage - The percentage value
 * @param {Object} options - Configuration options
 * @returns {Object} - RGB colors for background and text
 */
export const getHeatmapColors = (percentage, options = {}) => {
  const {
    minValue = -100,
    maxValue = 100,
    neutralValue = 0,
    minColor = [255, 0, 0],   // Red for lowest values
    maxColor = [0, 255, 0],   // Green for highest values
    neutralColor = [240, 240, 240] // Light gray for neutral value
  } = options;
  
  if (percentage === null || percentage === undefined) {
    return {
      backgroundColor: `rgb(${neutralColor[0]}, ${neutralColor[1]}, ${neutralColor[2]})`,
      textColor: '#000000'
    };
  }
  
  let backgroundColor;
  
  if (percentage < neutralValue) {
    // Value is below neutral, interpolate between minColor and neutralColor
    const range = neutralValue - minValue;
    const factor = (neutralValue - percentage) / range;
    
    const r = Math.round(neutralColor[0] - (factor * (neutralColor[0] - minColor[0])));
    const g = Math.round(neutralColor[1] - (factor * (neutralColor[1] - minColor[1])));
    const b = Math.round(neutralColor[2] - (factor * (neutralColor[2] - minColor[2])));
    
    backgroundColor = `rgb(${r}, ${g}, ${b})`;
  } else {
    // Value is above or equal to neutral, interpolate between neutralColor and maxColor
    const range = maxValue - neutralValue;
    const factor = (percentage - neutralValue) / range;
    
    const r = Math.round(neutralColor[0] + (factor * (maxColor[0] - neutralColor[0])));
    const g = Math.round(neutralColor[1] + (factor * (maxColor[1] - neutralColor[1])));
    const b = Math.round(neutralColor[2] + (factor * (maxColor[2] - neutralColor[2])));
    
    backgroundColor = `rgb(${r}, ${g}, ${b})`;
  }
  
  // Calculate appropriate text color for contrast
  const textColor = getTextColor(backgroundColor);
  
  return { backgroundColor, textColor };
};