const exteriorFinish = ['#d9d0bd', '#9e714d', '#b8b8b8', '#222326']
const exteriorAccent = ['#f3f3ef', '#e8e7de', '#dcdcd4', '#2a2b24']

export function RightPanel() {
  return (
    <aside className="right-panel">
      <div className="metric-row">
        <div className="metric-item"><strong>1</strong><span>Bed</span></div>
        <div className="metric-item"><strong>1.5</strong><span>Bath</span></div>
        <div className="metric-item"><strong>1,152</strong><span>sqft</span></div>
      </div>

      <div className="house-preview" />

      <section className="finish-block">
        <h3>Exterior Finish</h3>
        <div className="swatch-row">
          {exteriorFinish.map((color, index) => (
            <button key={color} className={`swatch ${index === 0 ? 'active' : ''}`} style={{ background: color }} />
          ))}
        </div>
        <p><strong>Renne Accoya</strong> Included</p>
      </section>

      <section className="finish-block">
        <h3>Exterior Accent</h3>
        <div className="swatch-row">
          {exteriorAccent.map((color, index) => (
            <button key={color} className={`swatch ${index === 0 ? 'active' : ''}`} style={{ background: color }} />
          ))}
        </div>
        <p><strong>Chalk</strong> Included</p>
      </section>

      <div className="preview-image" />

      <section className="finish-block compact-gap">
        <h3>Interior Wall Finish</h3>
        <div className="swatch-row">
          {['#efeee7', '#e6e4dd', '#d5d1c7', '#f6f5f0'].map((color, index) => (
            <button key={color} className={`swatch ${index === 0 ? 'active' : ''}`} style={{ background: color }} />
          ))}
        </div>
        <p><strong>Soft Chamois</strong> Included</p>
      </section>

      <div className="cost-bar">
        <div>
          <div className="cost">$288,000</div>
          <div className="cost-caption">Estimated Construction Cost</div>
        </div>
        <button className="order-btn">Order Now</button>
      </div>
    </aside>
  )
}
