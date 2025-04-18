export function getColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert hash to hex color
  const color = (hash & 0x00ffffff).toString(16).toUpperCase();
  return parseInt(color.padStart(6, '0'), 16);
}
