import { makeAutoObservable } from 'mobx'

export class ModelNodesStore {
  modelNodesByCanvasModelId = new Map<string, string[]>()

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  setModelNodes(canvasModelId: string, nodeNames: string[]) {
    this.modelNodesByCanvasModelId.set(canvasModelId, [...nodeNames])
  }

  removeModelNodes(canvasModelId: string) {
    this.modelNodesByCanvasModelId.delete(canvasModelId)
  }

  clear() {
    this.modelNodesByCanvasModelId.clear()
  }
}
