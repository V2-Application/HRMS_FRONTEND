// groupByColumnAndPunchDate.js
export default function groupByColumnAndPunchDate(entries = []) {
  const map = {}

  entries.forEach((e) => {
    const dateOnly = e.punchDate ? e.punchDate.split('T')[0] : ''
    const key = `${e.columnName} | ${dateOnly}` // label shown in left list

    if (!map[key]) map[key] = []
    map[key].push(e)
  })

  return map
}
