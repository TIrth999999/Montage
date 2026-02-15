import { makeAutoObservable } from 'mobx'
import type { Model } from '../types'
import type { CanvasModel } from '../types'

const toId = () => Math.random().toString(36).slice(2, 10)

export class CanvasStore {
  models: CanvasModel[] = []
  selectedModelId: string | null = null

  constructor() {
    makeAutoObservable(this)
  }

  addModel(model: Model) {
    const i = this.models.length
    const x = (i % 4) * 12 - 12
    const z = Math.floor(i / 4) * 8 - 6

    const canvasModel: CanvasModel = {
      id: toId(),
      modelId: model.id,
      name: model.name,
      glbUrl: model.glbUrl,
      position: [x, 0, z],
      rotation: [0, 0, 0],
    }
    this.models.push(canvasModel)
    this.selectedModelId = canvasModel.id
  }

  updateModelPosition(modelId: string, position: CanvasModel['position']) {
    const model = this.models.find((entry) => entry.id === modelId)
    if (!model) return
    model.position = [...position]
  }

  setSelectedModel(modelId: string | null) {
    this.selectedModelId = modelId
  }
}
