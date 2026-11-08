/**
 * Runs in the recorded page. Recordings don't show the mouse, so draw a ring
 * that follows it and pulses on each click.
 */
export const drawCursor = () => {
  const install = () => {
    if (document.getElementById('__demo-cursor')) return
    const dot = document.createElement('div')
    dot.id = '__demo-cursor'
    Object.assign(dot.style, {
      position: 'fixed',
      left: '-40px',
      top: '-40px',
      width: '28px',
      height: '28px',
      margin: '-14px 0 0 -14px',
      borderRadius: '50%',
      // A ring, so the control under it stays visible once clicked.
      background: 'rgba(239, 68, 68, 0.08)',
      border: '3px solid rgba(239, 68, 68, 0.85)',
      boxSizing: 'border-box',
      pointerEvents: 'none',
      zIndex: '2147483647',
      transition: 'transform 120ms ease-out',
    })
    document.documentElement.appendChild(dot)

    const move = (event: MouseEvent) => {
      dot.style.left = `${event.clientX}px`
      dot.style.top = `${event.clientY}px`
    }
    window.addEventListener('mousemove', move, true)
    window.addEventListener(
      'mousedown',
      (event) => {
        move(event)
        dot.style.transform = 'scale(1.8)'
      },
      true,
    )
    window.addEventListener(
      'mouseup',
      () => {
        dot.style.transform = 'scale(1)'
      },
      true,
    )
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install)
  } else {
    install()
  }
}
