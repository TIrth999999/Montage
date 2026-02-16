import { useCallback, useEffect, useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { Camera, Object3D, WebGLRenderer } from 'three'
import { Plane, Raycaster, Vector2, Vector3 } from 'three'
import type { CanvasModel, ModelNode } from '../types'
import type { ViewMode } from '../store/UIStore'
import { findSnapPosition } from './snapping'

type UseModelDragArgs = {
  model: CanvasModel
  viewMode: ViewMode
  gl: WebGLRenderer
  camera: Camera
  models: CanvasModel[]
  nodesByModelId: Map<string, ModelNode[]>
  setSelectedModel: (modelId: string | null) => void
  updateModelPosition: (modelId: string, position: [number, number, number]) => void
}

export function useModelDrag({
  model,
  viewMode,
  gl,
  camera,
  models,
  nodesByModelId,
  setSelectedModel,
  updateModelPosition,
}: UseModelDragArgs) {
  const isDraggingRef = useRef(false)
  const dragOffsetRef = useRef(new Vector3())
  const dragPlaneRef = useRef(new Plane(new Vector3(0, 1, 0), 0))
  const raycasterRef = useRef(new Raycaster())
  const pointerRef = useRef(new Vector2())
  const intersectionRef = useRef(new Vector3())

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) return
      const liveModel = models.find((entry) => entry.id === model.id)
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
      const snapResult = findSnapPosition({
        draggingModelId: model.id,
        draggingModelPosition: candidate,
        models,
        nodesByModelId,
      })
      updateModelPosition(model.id, snapResult?.nextPosition ?? candidate)
    }

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return
      const liveModel = models.find((entry) => entry.id === model.id)
      if (!liveModel) return

      isDraggingRef.current = false
      const snapResult = findSnapPosition({
        draggingModelId: model.id,
        draggingModelPosition: liveModel.position,
        models,
        nodesByModelId,
      })
      if (snapResult) {
        updateModelPosition(model.id, snapResult.nextPosition)
      }
      gl.domElement.style.cursor = 'default'
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [camera, gl.domElement, model.id, models, nodesByModelId, updateModelPosition])

  const onPointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      setSelectedModel(model.id)
      if (viewMode !== '2D') return

      event.stopPropagation()
      isDraggingRef.current = true

      const worldPosition = new Vector3()
      ;(event.eventObject as Object3D).getWorldPosition(worldPosition)
      dragOffsetRef.current.copy(worldPosition).sub(event.point)
      gl.domElement.style.cursor = 'grabbing'
    },
    [gl, model.id, setSelectedModel, viewMode],
  )

  return { onPointerDown }
}
