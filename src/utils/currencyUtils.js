// Utilidades para cotización bi-moneda (COP y USD) con TRM oficial de referencia
export const DEFAULT_TRM = 4150; // $4.150 COP por 1 USD

export const formatCOP = (val) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(val || 0);
};

export const formatUSD = (val) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(val || 0);
};

export const convertUSDToCOP = (usdVal, trm = DEFAULT_TRM) => {
  return Math.round((usdVal || 0) * trm);
};

export const convertCOPToUSD = (copVal, trm = DEFAULT_TRM) => {
  return Number(((copVal || 0) / trm).toFixed(2));
};

export const getDualPrice = (usdPrice, trm = DEFAULT_TRM) => {
  const cop = convertUSDToCOP(usdPrice, trm);
  const usd = Number(usdPrice);
  return {
    usd,
    cop,
    usdFormatted: formatUSD(usd),
    copFormatted: formatCOP(cop)
  };
};
