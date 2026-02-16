import { makeAutoObservable } from 'mobx'
import type { ModelNode } from '../types'

export class ModelNodesStore {
  modelNodesByCanvasModelId = new Map<string, ModelNode[]>()

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  setModelNodes(canvasModelId: string, nodes: ModelNode[]) {
    this.modelNodesByCanvasModelId.set(
      canvasModelId,
      nodes.map((node) => ({
        ...node,
        position: [...node.position],
        normal: [...node.normal],
      })),
    )
  }

  removeModelNodes(canvasModelId: string) {
    this.modelNodesByCanvasModelId.delete(canvasModelId)
  }

  clear() {
    this.modelNodesByCanvasModelId.clear()
  }
}
