// char-level diff (common prefix/suffix -> middle is diff)
export default function computeDiff(oldValueRaw, newvalueRaw) {
  let oldValue = oldValueRaw === null ? '' : String(oldValueRaw)
  let newValue = newvalueRaw === null ? '' : String(newvalueRaw)

  if (oldValue === newValue) {
    return {
      changed: false,
      oldChunks: [{ text: oldValue, type: 'same' }],
      newChunks: [{ text: newValue, type: 'same' }],
    }
  }

  let start = 0
  while (
    start < oldValue.length &&
    start < newValue.length &&
    oldValue[start] === newValue[start]
  ) {
    start++
  }

  let endOld = oldValue.length - 1
  let endNew = newValue.length - 1

  while (endOld >= start && endNew >= start && oldValue[endOld] === newValue[endNew]) {
    endOld--
    endNew--
  }

  const oldChunks = []
  const newChunks = []

  const addChunk = (arr = [], text, type) => {
    if (!text) return
    arr.push({ text, type })
  }

  addChunk(oldChunks, oldValue.slice(0, start), 'same')
  addChunk(oldChunks, oldValue.slice(start, endOld + 1), 'removed')
  addChunk(oldChunks, oldValue.slice(endOld + 1), 'same')

  addChunk(newChunks, newValue.slice(0, start), 'same')
  addChunk(newChunks, newValue.slice(start, endNew + 1), 'added')
  addChunk(newChunks, newValue.slice(endNew + 1), 'same')

  return {
    changed: true,
    oldChunks,
    newChunks,
  }
}
