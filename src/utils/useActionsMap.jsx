import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Reusable hook to compute actions map for the current route
 *
 * @param {Array} filteredSideMenu - The side menu array (from redux state?.auth)
 * @returns {Object} actionsMap - normalized actions with details (actionIds, status, furtherParts)
 */
export const useActionsMap = (filteredSideMenu) => {
  const { pathname } = useLocation()
  const [actionsMap, setActionsMap] = useState({})

  useEffect(() => {
    if (!Array.isArray(filteredSideMenu) || filteredSideMenu.length === 0) return

    // find items that match current pathname
    const data = filteredSideMenu
      .flatMap((group) => group.items || [])
      .filter((item) => item?.to === pathname)

    // normalization helper
    const norm = (s = '') => (s + '').trim().toLowerCase()

    const actionsDetailTemp = new Map()

    for (const item of data) {
      for (const a of item?.actions || []) {
        const key = norm(a?.actionName || String(a?.actionIds?.[0] || ''))

        if (!key) continue

        if (!actionsDetailTemp.has(key)) {
          actionsDetailTemp.set(key, {
            actionName: a.actionName || '',
            actionIds: new Set(a.actionIds || []),
            actionStatus: !!a.actionStatus,
            furtherPartsMap: new Map(),
          })

          // initialize furtherPartsMap
          for (const fp of a.furtherParts || []) {
            const fpId = fp?.actionFurtherPartId ?? null
            const fpName = fp?.actionFurtherPartName ?? (typeof fp === 'string' ? fp : null)
            const fpKey =
              fpId !== null
                ? String(fpId)
                : fpName
                  ? String(fpName).trim().toLowerCase()
                  : JSON.stringify(fp)
            actionsDetailTemp.get(key).furtherPartsMap.set(fpKey, fp)
          }
        } else {
          const existing = actionsDetailTemp.get(key)
          for (const id of a.actionIds || []) existing.actionIds.add(id)
          existing.actionStatus = existing.actionStatus || !!a.actionStatus

          // merge furtherParts
          for (const fp of a.furtherParts || []) {
            const fpId = fp?.actionFurtherPartId ?? null
            const fpName = fp?.actionFurtherPartName ?? (typeof fp === 'string' ? fp : null)
            const fpKey =
              fpId !== null
                ? String(fpId)
                : fpName
                  ? String(fpName).trim().toLowerCase()
                  : JSON.stringify(fp)
            if (!existing.furtherPartsMap.has(fpKey)) {
              existing.furtherPartsMap.set(fpKey, fp)
            } else {
              const exFp = existing.furtherPartsMap.get(fpKey)
              if (
                exFp &&
                typeof exFp.furtherPartStatus !== 'undefined' &&
                typeof fp.furtherPartStatus !== 'undefined'
              ) {
                exFp.furtherPartStatus = exFp.furtherPartStatus || fp.furtherPartStatus
                existing.furtherPartsMap.set(fpKey, exFp)
              }
            }
          }
        }
      }
    }

    // Convert maps -> plain objects
    const actionsDetailMap = {}
    for (const [k, v] of actionsDetailTemp) {
      actionsDetailMap[k] = {
        actionName: v.actionName,
        actionIds: Array.from(v.actionIds),
        actionStatus: !!v.actionStatus,
        furtherParts: Array.from(v.furtherPartsMap.values()),
      }
    }

    setActionsMap(actionsDetailMap)
  }, [filteredSideMenu, pathname])

  return actionsMap
}
