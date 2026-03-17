import { useRef, useEffect } from 'react'

function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null || typeof delay !== 'number') {
      return
    }

    const tick = () => savedCallback.current()

    const id = setTimeout(tick, delay)

    return () => clearTimeout(id)
  }, [delay])
}

export default useTimeout
