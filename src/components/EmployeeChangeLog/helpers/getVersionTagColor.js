export default function getVersionTagColor(versionLabel, isLatest) {
  if (isLatest) return 'green'
  if (versionLabel === 'v1') return 'default' // grey
  return 'blue' // mid versions
}
