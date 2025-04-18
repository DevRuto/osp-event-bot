export function parseValueInput(input) {
  if (!input) return null;

  const normalized = input.toLowerCase().replace(/,/g, '').trim();
  const match = normalized.match(/^(\d+(\.\d+)?)([kmb])?$/);

  if (!match) return null;

  const num = parseFloat(match[1]);
  const suffix = match[3];

  switch (suffix) {
    case 'k':
      return Math.round(num * 1_000);
    case 'm':
      return Math.round(num * 1_000_000);
    case 'b':
      return Math.round(num * 1_000_000_000);
    default:
      return Math.round(num);
  }
}

export function formatValueOutput(value) {
  if (typeof value !== 'number' || isNaN(value)) return null;

  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'b';
  } else if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'm';
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(2).replace(/\.00$/, '') + 'k';
  } else {
    return value.toString();
  }
}
