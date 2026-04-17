import { Socket } from 'socket.io'
import Simulation from './simulator'
import { PROGRAM_EVENT } from '@virtality/shared/types'
import { createAppLogger } from '@virtality/shared/observability'

const sim = new Simulation()
const logger = createAppLogger({
  serviceName: 'socket',
  defaultAttributes: {
    component: 'vr-comms-testing',
  },
})

const vrCommSim = {
  programStart: (roomCode: string | string[], socket: Socket) => {
    socket.on(PROGRAM_EVENT.Start, (data) => {
      logger.info('socket.simulation.program_start', {
        roomCode,
        socketId: socket.id,
        exerciseCount: data?.exerciseData?.length ?? 0,
      })
      socket.emit(PROGRAM_EVENT.StartAck)
      const { exerciseData } = data
      sim.exercises = exerciseData
      sim.start(socket)
    })
  },
  programPause: (roomCode: string | string[], socket: Socket) => {
    socket.on(PROGRAM_EVENT.Pause, () => {
      logger.info('socket.simulation.program_pause', {
        roomCode,
        socketId: socket.id,
      })
      sim.pause(socket)
      socket.emit(PROGRAM_EVENT.PauseAck)
    })
  },
  programEnd: (roomCode: string | string[], socket: Socket) => {
    socket.on(PROGRAM_EVENT.End, () => {
      logger.info('socket.simulation.program_end', {
        roomCode,
        socketId: socket.id,
      })
      sim.end()
      socket.emit(PROGRAM_EVENT.EndAck)
    })
  },
  onChangeExercise: (roomCode: string | string[], socket: Socket) => {
    socket.on(PROGRAM_EVENT.ChangeExercise, (exerciseId) => {
      logger.info('socket.simulation.exercise_change', {
        roomCode,
        socketId: socket.id,
        exerciseId,
      })
      sim.changeExercise(socket, exerciseId)
      socket.emit(PROGRAM_EVENT.ChangeExerciseAck)
    })
  },
  onSettingsChange: (roomCode: string | string[], socket: Socket) => {
    socket.on(PROGRAM_EVENT.SettingsChange, (data) => {
      logger.info('socket.simulation.settings_change', {
        roomCode,
        socketId: socket.id,
        payload: data,
      })
      socket.emit(PROGRAM_EVENT.SettingsChangeAck)
    })
  },
  warmupStart: (roomCode: string | string[], socket: Socket) => {
    socket.on(PROGRAM_EVENT.WarmupStart, () => {
      logger.info('socket.simulation.warmup_start', {
        roomCode,
        socketId: socket.id,
      })
      socket.emit(PROGRAM_EVENT.WarmupStartAck)
    })
  },
  warmupEnd: (roomCode: string | string[], socket: Socket) => {
    socket.on(PROGRAM_EVENT.WarmupEnd, () => {
      logger.info('socket.simulation.warmup_end', {
        roomCode,
        socketId: socket.id,
      })
      socket.emit(PROGRAM_EVENT.WarmupEndAck)
    })
  },
  sittingChange: (roomCode: string | string[], socket: Socket) => {
    socket.on(PROGRAM_EVENT.SittingChange, (data) => {
      logger.info('socket.simulation.sitting_change', {
        roomCode,
        socketId: socket.id,
        payload: data,
      })
      socket.emit(PROGRAM_EVENT.SittingChangeAck)
    })
  },
}

export default vrCommSim
