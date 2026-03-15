import { useEffect, useRef } from 'react'

/**
 * A hook that returns the current timestamp and a function to set the timestamp.
 * The timestamp is stored in a ref object and updated when the component mounts.
 * The now function returns the current timestamp.
 * The setNow function sets the timestamp to the given value.
 *
 * @example
 * const { ts, now, setNow } = useNow()
 * console.log(now()) // 1715769600000
 * setNow(1715769600000)
 */

function useNow() {
  const ts = useRef(0)

  useEffect(() => {
    ts.current = Date.now()
  }, [])

  const now = () => {
    return Date.now()
  }

  const setNow = (value: number) => {
    ts.current = value
  }

  return { ts, now, setNow }
}

export default useNow
