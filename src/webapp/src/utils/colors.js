export const teamColorsMap = {
  'Team Apple': '#E53935',
  'Team Orange': '#FF9800',
  'Team Pear': '#8BC34A',
  'Team Lemon': '#FFEB3B',
}

export function getTeamColor(teamName) {
  return teamColorsMap[teamName] || '#888' // fallback color
}
