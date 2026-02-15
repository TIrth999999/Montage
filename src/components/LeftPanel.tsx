import { observer } from 'mobx-react-lite'
import { useRootStore } from '../hooks/useRootStore'

const moduleCards = [
  { name: 'Annex-1', info: '$64,000    0 Bedroom    Half-bath    256 sqft' },
  { name: 'Annex-2', info: '$64,000    0 Bedroom    0 Bathroom    256 sqft' },
  { name: 'Annex-3', info: '$64,000    0 Bedroom    0 Bathroom    256 sqft' },
]

export const LeftPanel = observer(() => {
  const { modelStore, canvasStore } = useRootStore()

  return (
    <aside className="left-panel">
      <div className="left-rail">
        <button className="rail-item">
          <span className="rail-icon"><i className="fa-regular fa-square" /></span>
          <span>Design</span>
        </button>
        <button className="rail-item">
          <span className="rail-icon"><i className="fa-regular fa-window-restore" /></span>
          <span>Templates</span>
        </button>
        <button className="rail-item active">
          <span className="rail-icon"><i className="fa-solid fa-puzzle-piece" /></span>
          <span>Modules</span>
        </button>
        <button className="rail-item">
          <span className="rail-icon"><i className="fa-regular fa-bookmark" /></span>
          <span>Saved</span>
        </button>
      </div>

      <div className="left-content">
        <h2>Modules</h2>

        <div className="search-row">
          <span className="search-icon"><i className="fa-solid fa-magnifying-glass" /></span>
          <input type="text" placeholder="Search Modules" />
          <button className="filter-btn"><i className="fa-solid fa-sliders" /></button>
        </div>

        <div className="chip-row">
          {modelStore.models.map((model) => (
            <button key={model.id} className="module-chip" onClick={() => canvasStore.addModel(model)}>
              {model.name.charAt(0).toUpperCase() + model.name.slice(1)}
            </button>
          ))}
        </div>

        <div className="module-list">
          {moduleCards.map((card, index) => (
            <button
              key={card.name}
              className="module-card"
              onClick={() => modelStore.models[index % modelStore.models.length] && canvasStore.addModel(modelStore.models[index % modelStore.models.length])}
            >
              <div className="module-thumb" />
              <div className="module-title">{card.name}</div>
              <div className="module-info">{card.info}</div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
})
