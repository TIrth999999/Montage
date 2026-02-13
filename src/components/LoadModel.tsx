import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import type { CanvasModel } from '../types'

export function LoadModel({ model }: { model: CanvasModel }) {
  const { scene } = useGLTF(model.glbUrl)
  const clone = useMemo(() => scene.clone(true), [scene])

  return <primitive object={clone} position={model.position} rotation={model.rotation} castShadow receiveShadow />
}