'use client'
import { createSocket } from '@/socket'
import {
  ExerciseData,
  GAME_EVENT,
  PROGRAM_EVENT,
  ProgramStartPayload,
  VRDevice,
  WarmupPayload,
} from '@/types/models'
import { useEffect, useState } from 'react'
import { useDeviceCore } from '@virtality/react-query'
export type useDeviceData = ReturnType<typeof useDevice>

const useDevice = () => {
  const {
    data: initialDevices,
    createDevice,
    removeDevice,
    isLoading,
  } = useDeviceCore()

  const [devices, setDevices] = useState<VRDevice[]>([])

  useEffect(() => {
    if (!initialDevices) {
      return () => setDevices([])
    }

    const next: VRDevice[] = initialDevices.map((device) => {
      const socket = createSocket()
      return {
        data: device,
        socket,
        mutations: {
          setDeviceRoomCode: (roomCode: string) => {
            socket.io.opts.query.roomCode = roomCode
          },
          clearDeviceRoomCode: () => {
            socket.io.opts.query.roomCode = ''
          },
        },
        events: {
          startWarmup: (payload: WarmupPayload) => {
            socket.emit(PROGRAM_EVENT.WarmupStart, payload)
          },
          endWarmup: () => {
            socket.emit(PROGRAM_EVENT.WarmupEnd)
          },
          programStart: (payload: ProgramStartPayload) => {
            socket.emit(PROGRAM_EVENT.Start, payload)
          },
          programPause: () => {
            socket.emit(PROGRAM_EVENT.Pause)
          },
          programEnd: () => {
            socket.emit(PROGRAM_EVENT.End)
          },
          settingsChange: (payload: ExerciseData) => {
            socket.emit(PROGRAM_EVENT.SettingsChange, payload)
          },
          changeExercise: (payload: string) => {
            socket.emit(PROGRAM_EVENT.ChangeExercise, payload)
          },
          calibrateHeight: () => {
            socket.emit(PROGRAM_EVENT.CalibrateHeight)
          },
          resetPosition: () => {
            socket.emit(PROGRAM_EVENT.ResetPosition)
          },
          sittingChange: (payload: boolean) => {
            socket.emit(PROGRAM_EVENT.SittingChange, payload)
          },
          gameLoad: (payload: { avatarId: number }) => {
            socket.emit(GAME_EVENT.Load, payload)
          },
          gameStart: () => {
            socket.emit(GAME_EVENT.Start)
          },
          gameEnd: () => {
            socket.emit(GAME_EVENT.End)
          },
        },
      }
    })

    ;(() => setDevices(next))()
  }, [initialDevices])

  return {
    devices,
    isLoading,
    removeDevice,
    createDevice,
  }
}

export default useDevice
