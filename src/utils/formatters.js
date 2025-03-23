// Format date to readable string
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Format number with commas for thousands
export const formatNumber = (number, decimals = 2) => {
  return number.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// Format percentage
export const formatPercentage = (number, decimals = 2) => {
  return `${formatNumber(number, decimals)}%`;
};