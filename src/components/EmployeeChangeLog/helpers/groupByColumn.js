// group all entries by columnName
export default function groupByColumn(entries = []) {
  const map = {}
  entries.forEach((e) => {
    if (!map[e.columnName]) map[e.columnName] = []
    map[e.columnName].push(e)
  })

  return map
}
