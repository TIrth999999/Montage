import { createContext } from 'react'
import { ModelStore } from './ModelStore'
import { CanvasStore } from './CanvasStore'
import { UIStore } from './UIStore'
import { ModelNodesStore } from './ModelNodesStore'

export class RootStore {
  readonly modelStore: ModelStore
  readonly canvasStore: CanvasStore
  readonly uiStore: UIStore
  readonly modelNodesStore: ModelNodesStore

  constructor() {
    this.modelStore = new ModelStore()
    this.canvasStore = new CanvasStore()
    this.uiStore = new UIStore()
    this.modelNodesStore = new ModelNodesStore()
  }
}

export const rootStore = new RootStore()
export const RootStoreContext = createContext<RootStore | null>(null)
