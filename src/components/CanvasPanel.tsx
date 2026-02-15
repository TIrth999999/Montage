import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../hooks/useRootStore'
import { LoadModel } from './LoadModel'
import { Loader } from './Loader'

const Scene = observer(() => {
  const { canvasStore, uiStore } = useRootStore()

  return (
    <>
      <color attach="background" args={[uiStore.viewMode === '2D' ? '#ffffff' : '#f6f7f9']} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 10, 6]} intensity={1.1} castShadow={uiStore.viewMode === '3D'} />
      {uiStore.viewMode === '3D' ? (
        <PerspectiveCamera makeDefault position={[16, 14, 16]} fov={45} />
      ) : (
        <OrthographicCamera makeDefault position={[0, 80, 0]} rotation={[-Math.PI / 2, 0, 0]} zoom={35} />
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow={uiStore.viewMode === '3D'}>
        <planeGeometry args={[500, 500]} />
        {uiStore.viewMode === '2D' ? (
          <meshBasicMaterial color="#c6c2c2" />
        ) : (
          <meshStandardMaterial color="#f2f4f7" />
        )}
      </mesh>

      <Suspense fallback={<Loader />}>
        {canvasStore.models.map((model) => (
          <LoadModel key={model.id} model={model} />
        ))}
      </Suspense>

      <OrbitControls
        makeDefault
        enableRotate={uiStore.viewMode === '3D'}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={5}
        maxDistance={140}
      />
    </>
  )
})

export const CanvasPanel = observer(() => {
  const { uiStore, canvasStore } = useRootStore()

  return (
    <section className="canvas-panel">
      {uiStore.viewMode === '2D' && <div className="canvas-grid-overlay" />}

      <div className="canvas-top-tools">
        <button className="tool-chip active" aria-label="Plan"><i className="fa-solid fa-ruler-combined" /></button>
        <button className="tool-chip" aria-label="Measure"><i className="fa-solid fa-arrow-right" /></button>
        <button className="tool-chip" aria-label="Lock"><i className="fa-solid fa-lock" /></button>
        <button className="tool-chip" aria-label="Lock 2"><i className="fa-solid fa-unlock" /></button>
        <button className="tool-chip" aria-label="3D"><i className="fa-regular fa-circle" /></button>
        <button className="tool-chip" aria-label="Image"><i className="fa-regular fa-image" /></button>
      </div>

      <Canvas shadows onPointerMissed={() => canvasStore.setSelectedModel(null)}>
        <Scene />
      </Canvas>

      <div className="canvas-bottom-tools">
        <button aria-label="Undo"><i className="fa-solid fa-arrow-rotate-left" /></button>
        <button aria-label="Redo"><i className="fa-solid fa-arrow-rotate-right" /></button>
        <button aria-label="Zoom Out"><i className="fa-solid fa-magnifying-glass-minus" /></button>
        <button aria-label="Zoom In"><i className="fa-solid fa-magnifying-glass-plus" /></button>
      </div>

      <button className="canvas-help" aria-label="Help"><i className="fa-solid fa-question" /></button>
      <button className="canvas-side left" aria-label="Collapse Left"><i className="fa-solid fa-chevron-left" /></button>
      <button className="canvas-side right" aria-label="Collapse Right"><i className="fa-solid fa-chevron-right" /></button>

      <div className="view-toggle compact">
        <button
          className={uiStore.viewMode === '2D' ? 'active' : ''}
          onClick={() => uiStore.setViewMode('2D')}
        >
          2D
        </button>
        <button
          className={uiStore.viewMode === '3D' ? 'active' : ''}
          onClick={() => uiStore.setViewMode('3D')}
        >
          3D
        </button>
      </div>
    </section>
  )
})
