const KEY = 'perpix.visited'

/** Best-effort memory of a previous visit; storage can be unavailable. */
export const visitor = {
  isReturning(): boolean {
    try {
      return localStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  },
  markVisited() {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* private mode */
    }
  },
}
