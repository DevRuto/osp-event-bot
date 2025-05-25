export const teamColorsMap = {
  'Team Apple': '#E53935',
  'Team Orange': '#FF9800',
  'Team Pear': '#8BC34A',
  'Team Lemon': '#FFEB3B',
}

function stringToColor(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += value.toString(16).padStart(2, '0')
  }
  return color
}

export function getTeamColor(teamName) {
  return teamColorsMap[teamName] || stringToColor(teamName) // fallback color
}
