import { Html, useProgress } from '@react-three/drei'

export function Loader() {
  const { progress } = useProgress()

  return (
    <Html center>
      <div className="loader-container">
        <div>Loading models: {Math.round(progress)}%</div>
        <div className="loader-progress-track">
          <div className="loader-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </Html>
  )
}
