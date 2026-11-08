/**
 * Runs in the recorded page. Recordings don't show the mouse, so draw a dot
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
      width: '22px',
      height: '22px',
      margin: '-11px 0 0 -11px',
      borderRadius: '50%',
      background: 'rgba(239, 68, 68, 0.35)',
      border: '2px solid rgba(239, 68, 68, 0.9)',
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
