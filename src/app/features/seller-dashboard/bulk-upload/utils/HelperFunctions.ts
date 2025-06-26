export const parseNumber = (value: string | number | boolean | undefined): number | null => {
  if (value === undefined || value === null || value === '') return null;
  const num = parseFloat(value.toString().replace(/[,$]/g, ''));
  return isNaN(num) ? null : num;
};

export const parseBoolean = (value: string | number | boolean | undefined): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === '1' || lower === 'yes';
  }
  return false;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
