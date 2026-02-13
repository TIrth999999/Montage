import { useContext } from 'react'
import { RootStoreContext } from '../store/RootStore'

export function useRootStore() {
  const store = useContext(RootStoreContext)
  if (!store) {
    throw new Error('useRootStore must be used inside StoreProvider.')
  }

  return store
}
