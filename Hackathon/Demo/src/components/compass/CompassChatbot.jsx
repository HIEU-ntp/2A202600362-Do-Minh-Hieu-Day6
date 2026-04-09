function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 11.5 21 3l-4 18-5.2-6.1L3 11.5Zm8 2.1 3.3 3.8 2.1-9.8-10 4.7 4.6 1.3Z" fill="currentColor" />
    </svg>
  );
}

export default function CompassChatbot({
  chatMessages,
  isBotTyping,
  chatInput,
  onInputChange,
  onSend,
}) {
  return (
    <section className="compass-chat-wrap">
      <div className="compass-headline">
        <h2>Compass Assistant</h2>
        <p>Tu van nhanh theo nhu cau cua ban</p>
      </div>

      <div className="chat-box" role="log" aria-live="polite">
        {chatMessages.map((msg, index) => (
          <div key={`${msg.role}-${index}`} className={msg.role === "user" ? "bubble user" : "bubble bot"}>
            {msg.text}
          </div>
        ))}
        {isBotTyping && <div className="bubble bot">Dang phan tich...</div>}
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          value={chatInput}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Dat cau hoi ve nhu cau mua xe..."
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSend();
            }
          }}
        />
        <button type="button" className="send-btn" aria-label="Send message" onClick={onSend}>
          <SendIcon />
        </button>
      </div>
    </section>
  );
}
