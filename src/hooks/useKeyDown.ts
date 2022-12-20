import { useEffect, useCallback } from "react"

const useKeyDown = (targetKeyCode: KeyboardEvent['key']) => {

  let callback: null | ((e?: KeyboardEvent) => void) = null

  const keyDownCallBack = (fn: (e?: KeyboardEvent) => void) => {
    callback = fn
  }

  const keyDownHandler = useCallback((e: KeyboardEvent) => {
    if (e.key === targetKeyCode) {
      if (callback) {
        callback(e)
      }
    }
  }, [callback, targetKeyCode])

  useEffect(() => {
    document.addEventListener('keydown', keyDownHandler)
    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, [keyDownHandler])
  return keyDownCallBack
}

export default useKeyDown