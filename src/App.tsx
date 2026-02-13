import { rootStore } from './store/RootStore'
import { StoreProvider } from './context/StoreProvider'
import { Navbar } from './components/Navbar'
import { LeftPanel } from './components/LeftPanel'
import { CanvasPanel } from './components/CanvasPanel'
import './App.css'

export function App() {
  return (
    <StoreProvider store={rootStore}>
      <div className="app">
        <Navbar />
        <main className="layout">
          <LeftPanel />
          <CanvasPanel />
        </main>
      </div>
    </StoreProvider>
  )
}
