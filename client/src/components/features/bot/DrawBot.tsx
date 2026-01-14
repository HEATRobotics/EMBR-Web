import { RobotType } from '@/types/robot.type'
import React from 'react'

export default function DrawBot({bot, index, lat, lng}:{bot: RobotType, index: number, lat: number, lng: number}) {
  return (
    <div>
      <div>Bot #{index}</div>
      <div>Coordinates: {lat}, {lng}</div>
    </div>
  )
}
