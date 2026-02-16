import { useEffect, useMemo, useRef } from 'react'
import { Html, useGLTF } from '@react-three/drei'
import type { CanvasModel } from '../types'
import { Box3, BufferGeometry, LineBasicMaterial, Vector3 } from 'three'
import { useRootStore } from '../hooks/useRootStore'
import { observer } from 'mobx-react-lite'
import { useThree } from '@react-three/fiber'
import { applyPlan2DStyle } from './model2DStyle'
import { extractModelNodes } from './modelNodes'
import { useModelDrag } from './useModelDrag'

export const LoadModel = observer(({ model }: { model: CanvasModel }) => {
  const { modelNodesStore, canvasStore, uiStore } = useRootStore()
  const { scene } = useGLTF(model.glbUrl)
  const { gl, camera } = useThree()
  const clone = useMemo(() => scene.clone(true), [scene])
  const styleCleanupRef = useRef<(() => void) | null>(null)
  const selectionBounds = useMemo(() => {
    clone.updateMatrixWorld(true)
    const box = new Box3().setFromObject(clone)
    if (box.isEmpty()) return null

    const min = box.min.clone()
    const max = box.max.clone()
    clone.worldToLocal(min)
    clone.worldToLocal(max)

    const width = Math.max(0.01, Math.abs(max.x - min.x))
    const depth = Math.max(0.01, Math.abs(max.z - min.z))
    const centerX = (min.x + max.x) / 2
    const centerZ = (min.z + max.z) / 2
    const topY = max.y + 0.05

    return { width, depth, centerX, centerZ, topY }
  }, [clone])

  const selectionGeometry = useMemo(() => {
    if (!selectionBounds) return null
    const { width, depth } = selectionBounds
    const halfW = width / 2
    const halfD = depth / 2
    return new BufferGeometry().setFromPoints([
      new Vector3(-halfW, 0, -halfD),
      new Vector3(halfW, 0, -halfD),
      new Vector3(halfW, 0, halfD),
      new Vector3(-halfW, 0, halfD),
    ])
  }, [selectionBounds])

  const selectionMaterial = useMemo(
    () => new LineBasicMaterial({ color: '#ffc400', linewidth: 4 }),
    [],
  )

  const isSelected = canvasStore.selectedModelId === model.id

  useEffect(() => {
    const nodeEntries = extractModelNodes(clone)

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
    return () => {
      selectionGeometry?.dispose()
      selectionMaterial.dispose()
    }
  }, [selectionGeometry, selectionMaterial])

  const { onPointerDown } = useModelDrag({
    model,
    viewMode: uiStore.viewMode,
    gl,
    camera,
    models: canvasStore.models,
    nodesByModelId: modelNodesStore.modelNodesByCanvasModelId,
    setSelectedModel: (modelId) => canvasStore.setSelectedModel(modelId),
    updateModelPosition: (modelId, position) => canvasStore.updateModelPosition(modelId, position),
  })

  return (
    <primitive object={clone} position={model.position} rotation={model.rotation} castShadow receiveShadow onPointerDown={onPointerDown}>
      {uiStore.viewMode === '2D' && isSelected && selectionBounds && selectionGeometry && (
        <>
          <lineLoop
            geometry={selectionGeometry}
            material={selectionMaterial}
            position={[selectionBounds.centerX, selectionBounds.topY, selectionBounds.centerZ]}
            raycast={() => null}
          />
          <Html
            position={[selectionBounds.centerX, selectionBounds.topY + 0.45, selectionBounds.centerZ]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div className="selected-model-toolbar">
              <button aria-label="Move"><i className="fa-solid fa-left-right" /></button>
              <button aria-label="Align"><i className="fa-solid fa-object-group" /></button>
              <button aria-label="Duplicate"><i className="fa-regular fa-clone" /></button>
              <button aria-label="Delete"><i className="fa-regular fa-trash-can" /></button>
              <button aria-label="More"><i className="fa-solid fa-ellipsis" /></button>
            </div>
          </Html>
        </>
      )}
    </primitive>
  )
})
