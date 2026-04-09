export default function CompassLeadForm({
  leadName,
  leadPhone,
  leadNeed,
  leadNotice,
  onLeadNameChange,
  onLeadPhoneChange,
  onLeadNeedChange,
  onSubmit,
}) {
  return (
    <section className="lead-form-wrap">
      <div className="compass-headline">
        <h3>De lai thong tin</h3>
        <p>Nhan tu van ca nhan hoa</p>
      </div>
      <form className="lead-form" onSubmit={onSubmit}>
        <label>
          <span>Ho va ten</span>
          <input
            type="text"
            placeholder="Nguyen Van A"
            value={leadName}
            onChange={(event) => onLeadNameChange(event.target.value)}
          />
        </label>

        <label>
          <span>So dien thoai</span>
          <input
            type="tel"
            placeholder="09xxxxxxxx"
            value={leadPhone}
            onChange={(event) => onLeadPhoneChange(event.target.value)}
          />
        </label>

        <label>
          <span>Nhu cau them</span>
          <input
            type="text"
            placeholder="Vi du: can lai thu cuoi tuan"
            value={leadNeed}
            onChange={(event) => onLeadNeedChange(event.target.value)}
          />
        </label>

        <button type="submit" className="primary-btn">Gui thong tin</button>
        {leadNotice && <p className="lead-notice">{leadNotice}</p>}
      </form>
    </section>
  );
}
