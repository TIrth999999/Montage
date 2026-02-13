import { useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import type { CanvasModel, ModelNode } from '../types'
import { Euler, Mesh, Object3D, Plane, Quaternion, Raycaster, Vector2, Vector3 } from 'three'
import { useRootStore } from '../hooks/useRootStore'
import { observer } from 'mobx-react-lite'
import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { applyPlan2DStyle } from './model2DStyle'

const XZ_SNAP_DISTANCE = 0.8
const Y_TOLERANCE = 0.5
const PARALLEL_DOT_THRESHOLD = 0.95

type SnapResult = {
  nextPosition: [number, number, number]
  dragNodeName: string
  targetNodeName: string
  targetModelName: string
}

export const LoadModel = observer(({ model }: { model: CanvasModel }) => {
  const { modelNodesStore, canvasStore, uiStore } = useRootStore()
  const { scene } = useGLTF(model.glbUrl)
  const { gl, camera } = useThree()
  const clone = useMemo(() => scene.clone(true), [scene])
  const isDraggingRef = useRef(false)
  const dragOffsetRef = useRef(new Vector3())
  const dragPlaneRef = useRef(new Plane(new Vector3(0, 1, 0), 0))
  const raycasterRef = useRef(new Raycaster())
  const pointerRef = useRef(new Vector2())
  const intersectionRef = useRef(new Vector3())
  const styleCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const nodeEntries: ModelNode[] = []
    const rootWorldQuaternion = new Quaternion()
    const rootWorldQuaternionInverse = new Quaternion()
    const nodeCenterWorld = new Vector3()
    const nodeCenterLocal = new Vector3()
    const nodeDirectionWorld = new Vector3()
    const nodeDirectionLocal = new Vector3()

    clone.getWorldQuaternion(rootWorldQuaternion)
    rootWorldQuaternionInverse.copy(rootWorldQuaternion).invert()

    clone.updateMatrixWorld(true)
    clone.traverse((object) => {
      if (!(object instanceof Mesh)) return
      if (!/^node\d*$/i.test(object.name)) return

      if (object.geometry) {
        object.geometry.computeBoundingBox()
      }
      if (object.geometry?.boundingBox) {
        nodeCenterWorld.copy(object.geometry.boundingBox.getCenter(nodeCenterWorld)).applyMatrix4(object.matrixWorld)
      } else {
        object.getWorldPosition(nodeCenterWorld)
      }
      nodeCenterLocal.copy(nodeCenterWorld)
      clone.worldToLocal(nodeCenterLocal)

      object.getWorldDirection(nodeDirectionWorld)
      nodeDirectionLocal.copy(nodeDirectionWorld).applyQuaternion(rootWorldQuaternionInverse).normalize()
      const flatDirection = new Vector3(nodeDirectionLocal.x, 0, nodeDirectionLocal.z)
      if (flatDirection.lengthSq() > 0) {
        flatDirection.normalize()
      }

      nodeEntries.push({
        name: object.name,
        position: [nodeCenterLocal.x, nodeCenterLocal.y, nodeCenterLocal.z],
        direction: [flatDirection.x, flatDirection.y, flatDirection.z],
      })
    })

    modelNodesStore.setModelNodes(model.id, nodeEntries)

    return () => {
      modelNodesStore.removeModelNodes(model.id)
    }
  }, [clone, model.id, modelNodesStore])

  useEffect(() => {
    if (uiStore.viewMode === '2D') {
      styleCleanupRef.current?.()
      styleCleanupRef.current = applyPlan2DStyle(clone)
      return
    }

    styleCleanupRef.current?.()
    styleCleanupRef.current = null
  }, [clone, uiStore.viewMode])

  useEffect(() => {
    return () => {
      styleCleanupRef.current?.()
      styleCleanupRef.current = null
    }
  }, [])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) return
      const liveModel = canvasStore.models.find((entry) => entry.id === model.id)
      if (!liveModel) return

      const rect = gl.domElement.getBoundingClientRect()
      pointerRef.current.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      )

      raycasterRef.current.setFromCamera(pointerRef.current, camera)
      const hit = raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersectionRef.current)
      if (!hit) return

      const rawPosition = intersectionRef.current.clone().add(dragOffsetRef.current)
      const candidate: [number, number, number] = [rawPosition.x, liveModel.position[1], rawPosition.z]
      const snapResult = findSnapPosition(model.id, candidate, canvasStore.models, modelNodesStore.modelNodesByCanvasModelId)

      canvasStore.updateModelPosition(model.id, snapResult?.nextPosition ?? candidate)
    }

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return
      const liveModel = canvasStore.models.find((entry) => entry.id === model.id)
      if (!liveModel) return

      isDraggingRef.current = false
      const snapResult = findSnapPosition(
        model.id,
        liveModel.position,
        canvasStore.models,
        modelNodesStore.modelNodesByCanvasModelId,
      )
      if (snapResult) {
        canvasStore.updateModelPosition(model.id, snapResult.nextPosition)
        alert(
          `${model.name}.${snapResult.dragNodeName} snapped to ${snapResult.targetModelName}.${snapResult.targetNodeName}`,
        )
      }
      gl.domElement.style.cursor = 'default'
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [camera, canvasStore, gl.domElement, model.id, model.name, modelNodesStore.modelNodesByCanvasModelId])

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (uiStore.viewMode !== '2D') return

    event.stopPropagation()
    isDraggingRef.current = true

    const worldPosition = new Vector3()
    ;(event.eventObject as Object3D).getWorldPosition(worldPosition)
    dragOffsetRef.current.copy(worldPosition).sub(event.point)

    gl.domElement.style.cursor = 'grabbing'
  }

  return (
    <primitive
      object={clone}
      position={model.position}
      rotation={model.rotation}
      castShadow
      receiveShadow
      onPointerDown={onPointerDown}
    />
  )
})

function findSnapPosition(
  draggingModelId: string,
  draggingModelPosition: [number, number, number],
  models: CanvasModel[],
  nodesByModelId: Map<string, ModelNode[]>,
): SnapResult | null {
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
  const draggingRotation = new Euler(...draggingModel.rotation)
  const draggingRotationQuat = new Quaternion().setFromEuler(draggingRotation)
  const dragDirectionWorld = new Vector3()
  const targetDirectionWorld = new Vector3()

  for (const otherModel of models) {
    if (otherModel.id === draggingModelId) continue
    const otherNodes = nodesByModelId.get(otherModel.id)
    if (!otherNodes || otherNodes.length === 0) continue
    const targetRotation = new Euler(...otherModel.rotation)
    const targetRotationQuat = new Quaternion().setFromEuler(targetRotation)

    for (const dragNode of draggingNodes) {
      const dragWorldX = draggingModelPosition[0] + dragNode.position[0]
      const dragWorldY = draggingModelPosition[1] + dragNode.position[1]
      const dragWorldZ = draggingModelPosition[2] + dragNode.position[2]
      dragDirectionWorld.set(...dragNode.direction).applyQuaternion(draggingRotationQuat).setY(0)
      if (dragDirectionWorld.lengthSq() > 0) {
        dragDirectionWorld.normalize()
      }

      for (const targetNode of otherNodes) {
        const targetWorldX = otherModel.position[0] + targetNode.position[0]
        const targetWorldY = otherModel.position[1] + targetNode.position[1]
        const targetWorldZ = otherModel.position[2] + targetNode.position[2]
        targetDirectionWorld.set(...targetNode.direction).applyQuaternion(targetRotationQuat).setY(0)
        if (targetDirectionWorld.lengthSq() > 0) {
          targetDirectionWorld.normalize()
        }

        if (Math.abs(targetWorldY - dragWorldY) > Y_TOLERANCE) continue
        if (dragDirectionWorld.lengthSq() > 0 && targetDirectionWorld.lengthSq() > 0) {
          const parallelScore = Math.abs(dragDirectionWorld.dot(targetDirectionWorld))
          if (parallelScore < PARALLEL_DOT_THRESHOLD) continue
        }

        const dx = targetWorldX - dragWorldX
        const dz = targetWorldZ - dragWorldZ
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
      draggingModelPosition[0] + best.offsetX,
      draggingModelPosition[1],
      draggingModelPosition[2] + best.offsetZ,
    ],
    dragNodeName: best.dragNodeName,
    targetNodeName: best.targetNodeName,
    targetModelName: best.targetModelName,
  }
}
