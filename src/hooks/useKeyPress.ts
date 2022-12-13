import { useState, useEffect, useCallback } from "react"

const useKeyPress = (targetKeyCode: KeyboardEvent['key']) => {
  const [keyPressed, setKeyPressed] = useState(false)

  const keyDownHandler = useCallback((e: KeyboardEvent) => {
    if (e.key === targetKeyCode) {
      setKeyPressed(true)
    }
  }, [targetKeyCode])
  const keyUpHandler = useCallback((e: KeyboardEvent) => {
    if (e.key === targetKeyCode) {
      setKeyPressed(false)
    }
  }, [targetKeyCode])

  useEffect(() => {
    document.addEventListener('keydown', keyDownHandler)
    document.addEventListener('keyup', keyUpHandler)
    return () => {
      document.removeEventListener('keydown', keyDownHandler)
      document.removeEventListener('keyup', keyUpHandler)
    }
  }, [keyDownHandler, keyUpHandler])
  return keyPressed
}

export default useKeyPress