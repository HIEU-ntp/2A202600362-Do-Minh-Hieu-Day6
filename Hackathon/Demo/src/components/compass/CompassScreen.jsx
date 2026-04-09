import { useMemo, useState } from "react";
import mockData from "../../mock/recommendations.json";
import CompassChatbot from "./CompassChatbot";
import CompassCalculator from "./CompassCalculator";
import CompassRecommendations from "./CompassRecommendations";
import CompassLeadForm from "./CompassLeadForm";

export default function CompassScreen({ StatusBar, VinFastMark, BellIcon, BottomTabBar, activeTab, onChangeTab }) {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "bot",
      text: "Chao ban. Toi la tro ly la ban VinFast, ban hay cho toi biet nhu cau de toi goi y xe phu hop.",
    },
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const [budget, setBudget] = useState(1.4);
  const [passengers, setPassengers] = useState(5);
  const [priority, setPriority] = useState("balance");

  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadNeed, setLeadNeed] = useState("");
  const [leadNotice, setLeadNotice] = useState("");

  const baseRecommendations = mockData.recommendations || [];

  const computedRecommendations = useMemo(() => {
    const priorityBoost = {
      budget: { "VF e34": 8, "VF 8": 3, "VF 9": -4 },
      balance: { "VF e34": 2, "VF 8": 6, "VF 9": 0 },
      space: { "VF e34": -3, "VF 8": 2, "VF 9": 10 },
    };

    const passengerBoost = passengers >= 7
      ? { "VF 9": 8, "VF 8": 3, "VF e34": -6 }
      : passengers >= 5
        ? { "VF 8": 5, "VF 9": 2, "VF e34": 1 }
        : { "VF e34": 5, "VF 8": 2, "VF 9": -4 };

    const budgetBoost = budget >= 2
      ? { "VF 9": 6, "VF 8": 3, "VF e34": 1 }
      : budget >= 1.2
        ? { "VF 8": 6, "VF e34": 3, "VF 9": -2 }
        : { "VF e34": 8, "VF 8": 0, "VF 9": -8 };

    return baseRecommendations
      .map((item) => {
        const score = Math.max(
          55,
          Math.min(
            98,
            item.match +
              (priorityBoost[priority]?.[item.name] || 0) +
              (passengerBoost[item.name] || 0) +
              (budgetBoost[item.name] || 0)
          )
        );

        return {
          ...item,
          match: score,
        };
      })
      .sort((a, b) => b.match - a.match)
      .slice(0, 3);
  }, [baseRecommendations, budget, passengers, priority]);

  const estimatedMonthly = useMemo(() => {
    const safeBudget = Math.max(0.4, Number(budget) || 0.4);
    const monthly = (safeBudget * 1000000000 * 0.75) / 84;
    return Math.round(monthly / 1000000);
  }, [budget]);

  function buildBotReply(message) {
    const text = message.toLowerCase();
    if (text.includes("gia") || text.includes("ngan sach")) {
      return `Voi ngan sach ${budget} ty, chi phi tra gop uoc tinh khoang ${estimatedMonthly} trieu/thang. Ban co the uu tien ${computedRecommendations[0]?.name || "VF 8"}.`;
    }
    if (text.includes("gia dinh") || text.includes("nguoi")) {
      return `Neu thuong di ${passengers} nguoi, goi y hien tai cua toi la ${computedRecommendations[0]?.name || "VF 8"} vi diem phu hop dang cao nhat.`;
    }
    if (text.includes("sac") || text.includes("pin")) {
      return "Ban nen bo tri lich sac vao ban dem va giu muc pin trong khoang 20-80% de toi uu tuoi tho pin.";
    }
    return `Toi da cap nhat ho so nhu cau. Hien top goi y dang la ${computedRecommendations.map((x) => x.name).join(", ")}.`;
  }

  function sendMessage() {
    const value = chatInput.trim();
    if (!value || isBotTyping) return;

    setChatMessages((prev) => [...prev, { role: "user", text: value }]);
    setChatInput("");
    setIsBotTyping(true);

    window.setTimeout(() => {
      setChatMessages((prev) => [...prev, { role: "bot", text: buildBotReply(value) }]);
      setIsBotTyping(false);
    }, 560);
  }

  function submitLead(event) {
    event.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) {
      setLeadNotice("Vui long nhap ho ten va so dien thoai.");
      return;
    }
    setLeadNotice("Da ghi nhan thong tin. Tu van vien se lien he ban trong 24h.");
    setLeadName("");
    setLeadPhone("");
    setLeadNeed("");
  }

  return (
    <div className="screen compass-screen">
      <StatusBar />

      <div className="compass-top">
        <div className="compass-top-left">
          <VinFastMark small />
          <span className="compass-top-line" aria-hidden="true" />
        </div>
        <button type="button" className="icon-bubble compass-bell" aria-label="Notifications">
          <BellIcon />
        </button>
      </div>

      <CompassChatbot
        chatMessages={chatMessages}
        isBotTyping={isBotTyping}
        chatInput={chatInput}
        onInputChange={setChatInput}
        onSend={sendMessage}
      />

      <CompassCalculator
        budget={budget}
        passengers={passengers}
        priority={priority}
        estimatedMonthly={estimatedMonthly}
        onBudgetChange={setBudget}
        onPassengersChange={setPassengers}
        onPriorityChange={setPriority}
      />

      <CompassRecommendations recommendations={computedRecommendations} />

      <CompassLeadForm
        leadName={leadName}
        leadPhone={leadPhone}
        leadNeed={leadNeed}
        leadNotice={leadNotice}
        onLeadNameChange={setLeadName}
        onLeadPhoneChange={setLeadPhone}
        onLeadNeedChange={setLeadNeed}
        onSubmit={submitLead}
      />

      <BottomTabBar activeTab={activeTab} onChangeTab={onChangeTab} />
    </div>
  );
}
