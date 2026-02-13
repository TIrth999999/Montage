import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import type { CanvasModel } from '../types'
import { Mesh } from 'three'
import type { Material } from 'three'
import { useRootStore } from '../hooks/useRootStore'

export function LoadModel({ model }: { model: CanvasModel }) {
  const { modelNodesStore } = useRootStore()
  const { scene } = useGLTF(model.glbUrl)
  const clone = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    const nodeNames: string[] = []

    const paintBlue = (material: Material) => {
      if ('color' in material) {
        ;(material as Material & { color: { set: (value: string) => void } }).color.set('#0000ff')
      }
    }

    clone.traverse((object) => {
      if (!(object instanceof Mesh)) return
      if (!/^node\d*$/i.test(object.name)) return

      nodeNames.push(object.name)
      if (Array.isArray(object.material)) {
        object.material.forEach(paintBlue)
        return
      }
      if (object.material) {
        paintBlue(object.material)
      }
    })

    modelNodesStore.setModelNodes(model.id, nodeNames)

    return () => {
      modelNodesStore.removeModelNodes(model.id)
    }
  }, [clone, model.id, modelNodesStore])

  return <primitive object={clone} position={model.position} rotation={model.rotation} castShadow receiveShadow />
}
