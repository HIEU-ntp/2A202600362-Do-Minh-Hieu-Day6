export default function CompassLeadForm({
  leadName,
  leadPhone,
  leadEmail,
  leadNeed,
  wantsTestDrive,
  preferredLabel,
  leadNotice,
  disabled,
  onLeadNameChange,
  onLeadPhoneChange,
  onLeadEmailChange,
  onLeadNeedChange,
  onWantsTestDriveChange,
  onSubmit,
}) {
  return (
    <section className="lead-form-wrap">
      <div className="compass-headline">
        <h3>De lai thong tin</h3>
        <p>{preferredLabel || "Chon xe o Top 3 truoc khi gui."}</p>
      </div>
      <form className="lead-form" onSubmit={onSubmit}>
        <label>
          <span>Ho va ten</span>
          <input
            type="text"
            placeholder="Nguyen Van A"
            value={leadName}
            onChange={(e) => onLeadNameChange(e.target.value)}
            disabled={disabled}
          />
        </label>

        <label>
          <span>So dien thoai</span>
          <input
            type="tel"
            placeholder="09xxxxxxxx"
            value={leadPhone}
            onChange={(e) => onLeadPhoneChange(e.target.value)}
            disabled={disabled}
          />
        </label>

        <label>
          <span>Email (neu khong co SDT)</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={leadEmail}
            onChange={(e) => onLeadEmailChange(e.target.value)}
            disabled={disabled}
          />
        </label>

        <label className="check-row lead-check">
          <input
            type="checkbox"
            checked={wantsTestDrive}
            onChange={(e) => onWantsTestDriveChange(e.target.checked)}
            disabled={disabled}
          />
          <span>Toi muon dang ky lai thu</span>
        </label>

        <label>
          <span>Ghi chu</span>
          <input
            type="text"
            placeholder="Vi du: lien he cuoi tuan"
            value={leadNeed}
            onChange={(e) => onLeadNeedChange(e.target.value)}
            disabled={disabled}
          />
        </label>

        <button type="submit" className="primary-btn" disabled={disabled}>
          Gui thong tin
        </button>
        {leadNotice && <p className="lead-notice">{leadNotice}</p>}
      </form>
    </section>
  );
}
