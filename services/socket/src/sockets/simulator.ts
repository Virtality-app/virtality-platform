import { Socket } from 'socket.io'
import { PROGRAM_EVENT } from '@virtality/shared/types'
import { createAppLogger } from '@virtality/shared/observability'

type Exercise = {
  id: string
  exerciseId: string
  reps: number
  sets: number
  restTime: number
  holdTime: number
  speed: number
}

export default class Simulation {
  status: 'started' | 'paused' | 'ready' = 'ready'
  exercises: Exercise[] = []
  currentExercise = 0
  currentSet = 0
  currentRep = 0
  simulationInterval = 750
  activeInterval?: NodeJS.Timeout
  logger = createAppLogger({
    serviceName: 'socket',
    defaultAttributes: {
      component: 'simulation',
    },
  })

  start(socket: Socket) {
    this.status = 'started'
    this.logger.info('socket.simulation.started', {
      socketId: socket.id,
      exerciseCount: this.exercises.length,
    })

    this.activeInterval = setInterval(() => {
      const isLastRep =
        this.currentRep === this.exercises[this.currentExercise].reps - 1

      const isLastSet =
        this.currentSet === this.exercises[this.currentExercise].sets - 1

      const isLastExercise = this.currentExercise !== this.exercises.length - 1

      this.logger.debug('socket.simulation.tick', {
        socketId: socket.id,
        currentExercise: this.currentExercise,
        currentSet: this.currentSet,
        currentRep: this.currentRep,
      })

      socket.emit(
        PROGRAM_EVENT.RepEnd,
        JSON.stringify({
          previousRep: this.currentRep,
          progress: Math.random(),
        }),
      )

      if (isLastRep) {
        this.currentSet++
        this.currentRep = 0

        socket.emit(
          PROGRAM_EVENT.SetEnd,
          JSON.stringify({ previousSet: this.currentSet }),
        )

        if (isLastSet) {
          if (isLastExercise) {
            socket.emit(
              PROGRAM_EVENT.ChangeExercise,
              this.exercises[this.currentExercise].id,
            )
            this.currentExercise++
            this.currentRep = 0
            this.currentSet = 0
          } else {
            this.logger.info('socket.simulation.program_ended', {
              socketId: socket.id,
            })
            socket.emit(PROGRAM_EVENT.End)
            this.end()
          }
        }
      } else {
        this.currentRep++
      }
    }, this.simulationInterval)
  }

  pause(socket: Socket) {
    if (this.status === 'started') {
      clearInterval(this.activeInterval)
      this.activeInterval = undefined
      this.status = 'paused'
      this.logger.info('socket.simulation.paused', {
        socketId: socket.id,
      })
    } else {
      this.logger.info('socket.simulation.resumed', {
        socketId: socket.id,
      })
      this.start(socket)
    }
  }

  end() {
    clearInterval(this.activeInterval)
    this.activeInterval = undefined
    this.currentRep = 0
    this.currentSet = 0
    this.currentExercise = 0
    this.status = 'ready'
    this.logger.info('socket.simulation.reset')
  }

  changeExercise(socket: Socket, id: string) {
    this.end()
    this.currentExercise = this.exercises.findIndex((ex) => ex.id === id)
    this.logger.info('socket.simulation.change_exercise', {
      socketId: socket.id,
      exerciseId: id,
      index: this.currentExercise,
    })
    if (this.status === 'started') this.start(socket)
  }
}
