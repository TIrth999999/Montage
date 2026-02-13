import type { ReactNode } from 'react'
import type { RootStore } from '../store/RootStore'
import { RootStoreContext } from '../store/RootStore'

export function StoreProvider({ store, children }: { store: RootStore; children: ReactNode }) {
  return <RootStoreContext.Provider value={store}>{children}</RootStoreContext.Provider>
}
