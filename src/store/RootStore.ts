import { createContext } from 'react'
import { ModelStore } from './ModelStore'
import { CanvasStore } from './CanvasStore'
import { UIStore } from './UIStore'

export class RootStore {
  readonly modelStore: ModelStore
  readonly canvasStore: CanvasStore
  readonly uiStore: UIStore

  constructor() {
    this.modelStore = new ModelStore()
    this.canvasStore = new CanvasStore()
    this.uiStore = new UIStore()
  }
}

export const rootStore = new RootStore()
export const RootStoreContext = createContext<RootStore | null>(null)
