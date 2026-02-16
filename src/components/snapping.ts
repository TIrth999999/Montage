import { Euler, Quaternion, Vector3 } from 'three'
import type { CanvasModel, ModelNode } from '../types'

const XZ_SNAP_DISTANCE = 0.8
const Y_TOLERANCE = 0.5
const NORMAL_DOT_THRESHOLD = 0.95

export type SnapResult = {
  nextPosition: [number, number, number]
  dragNodeName: string
  targetNodeName: string
  targetModelName: string
}

type SnapInput = {
  draggingModelId: string
  draggingModelPosition: [number, number, number]
  models: CanvasModel[]
  nodesByModelId: Map<string, ModelNode[]>
}

type WorldNode = {
  worldPosition: Vector3
  worldNormal: Vector3
}

const toWorldNode = (() => {
  const rotationEuler = new Euler()
  const rotationQuat = new Quaternion()
  const worldPosition = new Vector3()
  const worldNormal = new Vector3()
  const modelWorldPosition = new Vector3()

  return (node: ModelNode, modelPosition: [number, number, number], modelRotation: [number, number, number]): WorldNode => {
    rotationEuler.set(...modelRotation)
    rotationQuat.setFromEuler(rotationEuler)

    worldPosition
      .set(...node.position)
      .applyQuaternion(rotationQuat)
      .add(modelWorldPosition.set(...modelPosition))

    worldNormal
      .set(...node.normal)
      .applyQuaternion(rotationQuat)
      .setY(0)
      .normalize()

    return {
      worldPosition: worldPosition.clone(),
      worldNormal: worldNormal.clone(),
    }
  }
})()

export function findSnapPosition({
  draggingModelId,
  draggingModelPosition,
  models,
  nodesByModelId,
}: SnapInput): SnapResult | null {
  const draggingNodes = nodesByModelId.get(draggingModelId)
  const draggingModel = models.find((entry) => entry.id === draggingModelId)

  if (!draggingNodes || draggingNodes.length === 0 || !draggingModel) return null

  let best: {
    distanceXZ: number
    offsetX: number
    offsetZ: number
    dragNodeName: string
    targetNodeName: string
    targetModelName: string
  } | null = null
  const dragNormal2D = new Vector3()
  const targetNormal2D = new Vector3()

  for (const otherModel of models) {
    if (otherModel.id === draggingModelId) continue
    const otherNodes = nodesByModelId.get(otherModel.id)
    if (!otherNodes || otherNodes.length === 0) continue

    for (const dragNode of draggingNodes) {
      const dragWorld = toWorldNode(dragNode, draggingModelPosition, draggingModel.rotation)

      for (const targetNode of otherNodes) {
        const targetWorld = toWorldNode(targetNode, otherModel.position, otherModel.rotation)
        if (Math.abs(targetWorld.worldPosition.y - dragWorld.worldPosition.y) > Y_TOLERANCE) continue

        dragNormal2D.copy(dragWorld.worldNormal).setY(0)
        targetNormal2D.copy(targetWorld.worldNormal).setY(0)
        if (dragNormal2D.lengthSq() === 0 || targetNormal2D.lengthSq() === 0) continue
        dragNormal2D.normalize()
        targetNormal2D.normalize()
        const normalAlignment = Math.abs(dragNormal2D.dot(targetNormal2D))
        if (normalAlignment < NORMAL_DOT_THRESHOLD) continue

        const dx = targetWorld.worldPosition.x - dragWorld.worldPosition.x
        const dz = targetWorld.worldPosition.z - dragWorld.worldPosition.z
        const distanceXZ = Math.hypot(dx, dz)
        if (distanceXZ > XZ_SNAP_DISTANCE) continue

        if (!best || distanceXZ < best.distanceXZ) {
          best = {
            distanceXZ,
            offsetX: dx,
            offsetZ: dz,
            dragNodeName: dragNode.name,
            targetNodeName: targetNode.name,
            targetModelName: otherModel.name,
          }
        }
      }
    }
  }

  if (!best) return null

  return {
    nextPosition: [
      draggingModelPosition[0] + best.offsetX+0.01,
      draggingModelPosition[1],
      draggingModelPosition[2] + best.offsetZ+0.01,
    ],
    dragNodeName: best.dragNodeName,
    targetNodeName: best.targetNodeName,
    targetModelName: best.targetModelName,
  }
}
