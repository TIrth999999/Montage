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
      <color attach="background" args={[uiStore.viewMode === '2D' ? '#ececec' : '#f6f7f9']} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 10, 6]} intensity={1.1} castShadow />
      {uiStore.viewMode === '3D' ? (
        <PerspectiveCamera makeDefault position={[16, 14, 16]} fov={45} />
      ) : (
        <OrthographicCamera makeDefault position={[0, 80, 0]} rotation={[-Math.PI / 2, 0, 0]} zoom={35} />
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color={uiStore.viewMode === '2D' ? '#f0f0f0' : '#f2f4f7'} />
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
  const { uiStore } = useRootStore()

  return (
    <section className="canvas-panel">
      <div className="view-toggle">
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

      <Canvas shadows>
        <Scene />
      </Canvas>
    </section>
  )
})
