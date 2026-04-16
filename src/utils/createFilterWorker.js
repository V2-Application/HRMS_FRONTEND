// utils/createFilterWorker.js
export function createFilterWorker() {
  const workerCode = `
    const normalize = (v) => (v === null || v === undefined) ? '' : String(v).toLowerCase();
    const intersect = (sets) => {
      if (!sets.length) return new Set();
      sets.sort((a,b)=>a.size-b.size);
      const [first, ...rest] = sets;
      const out = new Set();
      first.forEach(id => {
        for (let s of rest) { if (!s.has(id)) return; }
        out.add(id);
      });
      return out;
    };

    let rows = [];
    let byColValue = {};   // { colKey: Map(valueLower -> Set(rowIdx)) }
    let searchable = [];   // precomputed lowercased concatenation for global search
    let colKeys = [];

    const buildIndexes = (data, keys) => {
      rows = Array.isArray(data) ? data : [];
      colKeys = Array.isArray(keys) ? keys : [];
      byColValue = {};
      searchable = new Array(rows.length);
      colKeys.forEach(k => byColValue[k] = new Map());

      for (let i=0;i<rows.length;i++){
        const r = rows[i];
        for (let k of colKeys){
          const val = normalize(r?.[k]);
          if (!byColValue[k].has(val)) byColValue[k].set(val, new Set());
          byColValue[k].get(val).add(i);
        }
        // one-time concatenation for fast substring search
        const concat = Object.values(r ?? {}).map(normalize).join(' ');
        searchable[i] = concat;
      }
    };

    const applyFilters = ({ filters, searchTerm }) => {
      const activeSets = [];

      // For each column: union of all selected values
      for (const [col, values] of Object.entries(filters || {})){
        if (!values || !values.length) continue;
        const colMap = byColValue[col];
        if (!colMap) continue;
        const union = new Set();
        for (const raw of values){
          const v = normalize(raw);
          const s = colMap.get(v);
          if (s) s.forEach(id => union.add(id));
        }
        activeSets.push(union);
      }

      // Start candidate set
      let candidate;
      if (activeSets.length){
        candidate = intersect(activeSets);
      } else {
        candidate = new Set(Array.from({length: rows.length}, (_,i)=>i));
      }

      // Global search (substring on precomputed searchable array)
      const term = normalize(searchTerm || '');
      if (term) {
        const next = new Set();
        candidate.forEach(i => {
          if (searchable[i].includes(term)) next.add(i);
        });
        candidate = next;
      }

      // Return actual rows
      return Array.from(candidate).map(i => rows[i]);
    };

    self.onmessage = (e) => {
      const { type, payload } = e.data || {};
      if (type === 'BUILD') {
        buildIndexes(payload?.data, payload?.colKeys);
        self.postMessage({ type: 'BUILT' });
      } else if (type === 'FILTER') {
        const result = applyFilters(payload || {});
        self.postMessage({ type: 'RESULT', rows: result });
      }
    };
  `

  const blob = new Blob([workerCode], { type: 'application/javascript' })
  return new Worker(URL.createObjectURL(blob))
}
