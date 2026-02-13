import { observer } from 'mobx-react-lite'
import { useRootStore } from '../hooks/useRootStore'

export const LeftPanel = observer(() => {
  const { modelStore, canvasStore } = useRootStore()

  return (
    <aside className="left-panel">
      <h2>Models</h2>
      <div className="left-list">
        {modelStore.models.map((model) => (
          <button key={model.id} className="item-btn" onClick={() => canvasStore.addModel(model)}>
            {model.name}
          </button>
        ))}
      </div>
    </aside>
  )
})
