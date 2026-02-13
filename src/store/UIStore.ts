import { makeAutoObservable } from 'mobx'

export type ViewMode = '2D' | '3D'

export class UIStore {
  viewMode: ViewMode = '3D'

  constructor() {
    makeAutoObservable(this)
  }

  setViewMode(mode: ViewMode) {
    this.viewMode = mode
  }
}
