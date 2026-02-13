import { makeAutoObservable } from 'mobx'
import type { Model } from '../types'

export class ModelStore {
  models: Model[] = [
    { id: 'annex', name: 'Annex', glbUrl: '/models/Annex_tag.glb' },
    { id: 'dwelling', name: 'Dwelling', glbUrl: '/models/Dwelling_tag.glb' },
    { id: 'lifestyle', name: 'Lifestyle', glbUrl: '/models/Lifestyle_tag.glb' },
  ]

  constructor() {
    makeAutoObservable(this)
  }
}
