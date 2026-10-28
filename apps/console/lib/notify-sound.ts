const beep = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  oscillator.frequency.value = 800
  oscillator.type = 'sine'
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.15,
  )
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.15)
}

/** Two short beeps that draw the clinician's eye to an attention toast. */
export const playAttentionSound = () => {
  try {
    const audioContext = new (
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    )()
    beep(audioContext)
    setTimeout(() => beep(audioContext), 150)
  } catch {
    // Ignore if audio fails (e.g. user gesture required)
  }
}
