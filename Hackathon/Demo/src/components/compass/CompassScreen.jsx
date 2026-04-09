import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import vehiclesCatalog from "@data/vehicles.json";
import baseSystemPrompt from "../../../../../src/04_chatbot_agent_flow/system_prompt.txt?raw";
import {
  AGENT_TOOL_DEFINITIONS,
  buildRecommendArgsFromProfile,
  createAgentToolHandler,
} from "../../lib/agentTools.js";
import { extractAgentProfile, mergeUserTexts, wantsCostExplanation } from "../../lib/extractAgentProfile.js";
import { calculatorSummary } from "../../lib/calculator.js";
import { appendLead } from "../../lib/leadStore.js";
import {
  applyIntakeAnswer,
  buildIntakeProfile,
  intakePrompt,
  nextIntakeStep,
} from "../../lib/intakeFlow.js";
import { chatUiToApiMessages, getOpenAIConfig, runOpenAIAgent } from "../../lib/openaiAgent.js";
import { displayVehicleName, reasonLine, recommendFromProfile, vehicleSlug } from "../../lib/recommendEngine.js";
import CompassChatbot from "./CompassChatbot";
import CompassCalculator from "./CompassCalculator";
import CompassLeadForm from "./CompassLeadForm";
import CompassRecommendations from "./CompassRecommendations";

const VEHICLES = vehiclesCatalog.vehicles || [];
const PRICE_DISCLAIMER =
  "Gia niem yet tham khao, co the thay doi. Lien he showroom VinFast de xac nhan.";

const AGENT_BOOT =
  "Xin chao! Toi la tro ly VinFast (AI). Ban cu noi tu nhien: ngan sac, so nguoi, muc dich, km/thang, uu tien — toi se hoi them neu thieu va goi y xe bang du lieu chinh xac.";

const SYSTEM_AGENT = `${baseSystemPrompt}

[He thong] Ten tool: recommend_vehicle, calculate_cost, compare_vehicles. Khi da co ngan sac khach, goi recommend_vehicle. Khong tu bia gia hay thong so ngoai ket qua tool.`;

export default function CompassScreen({
  StatusBar,
  VinFastMark,
  BellIcon,
  BottomTabBar,
  activeTab,
  onChangeTab,
  session,
}) {
  const { apiKey: openaiKey, model: openaiModel } = getOpenAIConfig();
  const canUseAgent = Boolean(openaiKey);

  const [agentMode, setAgentMode] = useState(() => canUseAgent);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState(() =>
    canUseAgent
      ? [{ role: "bot", text: AGENT_BOOT }]
      : [
          {
            role: "bot",
            text: "Chao ban. Toi se hoi 5 cau ngan de goi y xe. Ban cung co the nhan 'Bo qua' de dung mac dinh.",
          },
          { role: "bot", text: intakePrompt("BUDGET") },
        ],
  );
  const [isBotTyping, setIsBotTyping] = useState(false);

  const [intake, setIntake] = useState({
    budget_million_max: null,
    family_size: null,
    usage: "",
    km_per_month: null,
    priority: null,
    vehicle_type: "car",
  });
  const intakeRef = useRef(intake);
  useEffect(() => {
    intakeRef.current = intake;
  }, [intake]);

  const [recommendations, setRecommendations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [tenureMonths, setTenureMonths] = useState(60);
  const [annualRate, setAnnualRate] = useState(0.1);

  const [leadName, setLeadName] = useState(session?.displayName || "");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState(session?.email || "");
  const [leadNeed, setLeadNeed] = useState("");
  const [wantsTestDrive, setWantsTestDrive] = useState(false);
  const [leadNotice, setLeadNotice] = useState("");

  const currentStep = nextIntakeStep(intake);
  const intakeDone = currentStep === "DONE";

  const selectedVehicle = useMemo(() => {
    if (!selectedId) return null;
    return VEHICLES.find((v) => vehicleSlug(v) === selectedId) || null;
  }, [selectedId]);

  const calcSummary = useMemo(() => {
    if (!selectedVehicle) return null;
    return calculatorSummary(selectedVehicle, {
      downPaymentPercent,
      tenureMonths,
      annualInterestRate: annualRate,
      vehicleId: selectedId,
      vehicleName: displayVehicleName(selectedVehicle),
    });
  }, [selectedVehicle, selectedId, downPaymentPercent, tenureMonths, annualRate]);

  const pushBot = useCallback((text) => {
    setChatMessages((prev) => [...prev, { role: "bot", text }]);
  }, []);

  const runRecommend = useCallback(
    (prof) => {
      const res = recommendFromProfile(VEHICLES, prof);
      const withReason = (res.top3 || []).map((row) => ({
        ...row,
        reason: reasonLine(row, prof),
      }));
      setRecommendations(withReason);
      if (withReason[0]?.id) setSelectedId(withReason[0].id);
      const names = withReason.map((x) => displayVehicleName(x)).join(", ");
      pushBot(`Top 3 goi y: ${names}. Chon mot xe ben duoi de tinh chi phi va gui lead.`);
    },
    [pushBot],
  );

  function resetIntake() {
    setIntake({
      budget_million_max: null,
      family_size: null,
      usage: "",
      km_per_month: null,
      priority: null,
      vehicle_type: "car",
    });
    setRecommendations([]);
    setSelectedId(null);
    setLeadNotice("");
    if (agentMode && canUseAgent) {
      setChatMessages([{ role: "bot", text: AGENT_BOOT }]);
    } else {
      setChatMessages([{ role: "bot", text: "Bat dau lai. " + intakePrompt("BUDGET") }]);
    }
  }

  function skipIntake() {
    const filled = {
      budget_million_max: 2000,
      family_size: 5,
      usage: "gia dinh",
      km_per_month: 1200,
      priority: ["rong"],
      vehicle_type: "car",
    };
    setIntake(filled);
    setRecommendations([]);
    setSelectedId(null);
    pushBot("Da dung mac dinh: 2000 trieu, 5 cho, gia dinh, 1200 km/thang, uu tien rong.");
    const prof = buildIntakeProfile(filled);
    runRecommend(prof);
  }

  function processUserMessage(raw) {
    const value = raw.trim();
    if (!value) return;

    if (!agentMode && value.toLowerCase() === "bo qua") {
      skipIntake();
      return;
    }

    const state = intakeRef.current;
    const done = nextIntakeStep(state) === "DONE";

    if (!done) {
      const step = nextIntakeStep(state);
      const { patch, error } = applyIntakeAnswer(state, step, value);
      if (error) {
        pushBot(error);
        return;
      }
      const next = { ...state, ...patch };
      setIntake(next);
      const after = nextIntakeStep(next);
      if (after === "DONE") {
        pushBot("Cam on ban. Dang tinh goi y...");
        runRecommend(buildIntakeProfile(next));
      } else {
        pushBot(intakePrompt(after));
      }
      return;
    }

    const lower = value.toLowerCase();
    if (lower.includes("gia") || lower.includes("ngan sach")) {
      const prof = buildIntakeProfile(state);
      pushBot(
        `Ngan sac ban cung cap: toi da ${prof.budget_million_max} trieu VND. ${PRICE_DISCLAIMER}`,
      );
      return;
    }
    if (lower.includes("lai thu") || lower.includes("showroom")) {
      pushBot("Ban co the tick 'dang ky lai thu' o form ben duoi va de lai SDT/email.");
      return;
    }
    pushBot("Ban xem Top 3 ben duoi, chon xe de tinh chi phi, hoac gui form lien he.");
  }

  const onRecommendFromTool = useCallback((enriched) => {
    setRecommendations(enriched);
    if (enriched[0]?.id) setSelectedId(enriched[0].id);
  }, []);

  const toolHandlerRef = useRef(createAgentToolHandler(VEHICLES, onRecommendFromTool));
  useEffect(() => {
    toolHandlerRef.current = createAgentToolHandler(VEHICLES, onRecommendFromTool);
  }, [onRecommendFromTool]);

  async function sendWithOpenAI(value) {
    const nextUi = [...chatMessages, { role: "user", text: value }];
    setChatMessages(nextUi);
    setChatInput("");
    setIsBotTyping(true);
    try {
      const blob = mergeUserTexts(nextUi);
      const profile = extractAgentProfile(blob);
      const recArgs = buildRecommendArgsFromProfile(profile);
      let systemSuffix = "";

      let recJson = null;
      let recParsed = null;
      if (recArgs) {
        recJson = await toolHandlerRef.current("recommend_vehicle", recArgs);
        systemSuffix += `[TOOL_RESULT recommend_vehicle]\n${recJson}\n`;
        systemSuffix +=
          "Ban CHI duoc mo ta cac xe co trong top3 (model/variant/id/score). TUYET DOI KHONG neu ten xe khong co trong JSON (khong Fadil, Lux, o to xang neu khong co trong top3).\n";
        try {
          recParsed = JSON.parse(recJson);
        } catch {
          recParsed = null;
        }
      } else {
        systemSuffix +=
          "[He thong] Chua trich duoc ngan sac tu hoi thoai. Hoi khach ro ngan sac (trieu VND hoac ty VND). Khong liet ke xe cu the.\n";
      }

      if (recArgs && wantsCostExplanation(value) && recParsed?.top3?.[0]?.id) {
        const calcJson = await toolHandlerRef.current("calculate_cost", {
          vehicle_id: recParsed.top3[0].id,
          down_payment_percent: 20,
          tenure_months: 60,
          annual_interest_rate: 0.1,
        });
        systemSuffix += `[TOOL_RESULT calculate_cost]\n${calcJson}\n`;
      }

      const apiMsgs = chatUiToApiMessages(nextUi);
      const reply = await runOpenAIAgent({
        apiKey: openaiKey,
        model: openaiModel,
        systemPrompt: SYSTEM_AGENT,
        systemSuffix,
        userAssistantMessages: apiMsgs,
        tools: AGENT_TOOL_DEFINITIONS,
        onToolCall: (name, args) => toolHandlerRef.current(name, args),
      });
      setChatMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        { role: "bot", text: `Loi OpenAI: ${e.message || e}` },
      ]);
    } finally {
      setIsBotTyping(false);
    }
  }

  function sendMessage() {
    const value = chatInput.trim();
    if (!value || isBotTyping) return;
    if (agentMode && canUseAgent) {
      void sendWithOpenAI(value);
      return;
    }
    setChatMessages((prev) => [...prev, { role: "user", text: value }]);
    setChatInput("");
    setIsBotTyping(true);
    window.setTimeout(() => {
      processUserMessage(value);
      setIsBotTyping(false);
    }, 400);
  }

  function onSelectReco(item) {
    setSelectedId(item.id);
  }

  function submitLead(event) {
    event.preventDefault();
    setLeadNotice("");
    if (!selectedId || !selectedVehicle) {
      setLeadNotice("Chon mot xe o Top 3.");
      return;
    }
    try {
      appendLead({
        name: leadName,
        phone: leadPhone,
        email: leadEmail,
        preferred_vehicle_id: selectedId,
        preferred_vehicle_name: displayVehicleName(selectedVehicle),
        wants_test_drive: wantsTestDrive,
        notes: leadNeed,
      });
      setLeadNotice("Da luu lead (mock) vao localStorage cua trinh duyet.");
      setLeadNeed("");
      setWantsTestDrive(false);
    } catch (e) {
      setLeadNotice(String(e.message || e));
    }
  }

  const preferredLabel = selectedVehicle
    ? `Xe dang chon: ${displayVehicleName(selectedVehicle)}`
    : "";

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

      <div className="compass-toolbar compass-toolbar-col">
        {!canUseAgent && (
          <p className="agent-banner">
            Them <code>VITE_OPENAI_API_KEY</code> vao file <code>.env</code> trong thu muc Demo roi chay lai{" "}
            <code>npm run dev</code> de dung che do AI.
          </p>
        )}
        <div className="compass-toolbar-row">
          {canUseAgent && (
            <button
              type="button"
              className={agentMode ? "pill-btn active" : "pill-btn"}
              onClick={() => {
                setAgentMode(true);
                setChatMessages([{ role: "bot", text: AGENT_BOOT }]);
              }}
            >
              AI agent
            </button>
          )}
          <button
            type="button"
            className={!agentMode ? "pill-btn active" : "pill-btn"}
            onClick={() => {
              setAgentMode(false);
              setChatMessages([
                {
                  role: "bot",
                  text: "Che do cau hoi co dinh. " + intakePrompt("BUDGET"),
                },
              ]);
              setIntake({
                budget_million_max: null,
                family_size: null,
                usage: "",
                km_per_month: null,
                priority: null,
                vehicle_type: "car",
              });
              setRecommendations([]);
              setSelectedId(null);
            }}
          >
            Cau hoi co dinh
          </button>
          <button type="button" className="text-link small-link" onClick={resetIntake}>
            Xoa chat
          </button>
          {!agentMode && (
            <button type="button" className="text-link small-link" onClick={skipIntake}>
              Bo qua (mac dinh)
            </button>
          )}
        </div>
      </div>

      <CompassChatbot
        chatMessages={chatMessages}
        isBotTyping={isBotTyping}
        chatInput={chatInput}
        hint={
          agentMode && canUseAgent
            ? `OpenAI (${openaiModel}) + cong cu du lieu xe`
            : !intakeDone
              ? `Buoc: ${currentStep}`
              : "Hoan tat intake"
        }
        onInputChange={setChatInput}
        onSend={sendMessage}
      />

      <CompassRecommendations
        recommendations={recommendations}
        selectedId={selectedId}
        onSelect={onSelectReco}
      />

      <CompassCalculator
        vehicleName={selectedVehicle ? displayVehicleName(selectedVehicle) : ""}
        summary={calcSummary}
        downPaymentPercent={downPaymentPercent}
        tenureMonths={tenureMonths}
        annualRate={annualRate}
        onDownPaymentChange={setDownPaymentPercent}
        onTenureChange={setTenureMonths}
        onAnnualRateChange={setAnnualRate}
        disclaimer={PRICE_DISCLAIMER}
      />

      <CompassLeadForm
        leadName={leadName}
        leadPhone={leadPhone}
        leadEmail={leadEmail}
        leadNeed={leadNeed}
        wantsTestDrive={wantsTestDrive}
        preferredLabel={preferredLabel}
        leadNotice={leadNotice}
        disabled={!selectedVehicle}
        onLeadNameChange={setLeadName}
        onLeadPhoneChange={setLeadPhone}
        onLeadEmailChange={setLeadEmail}
        onLeadNeedChange={setLeadNeed}
        onWantsTestDriveChange={setWantsTestDrive}
        onSubmit={submitLead}
      />

      <BottomTabBar activeTab={activeTab} onChangeTab={onChangeTab} session={session} />
    </div>
  );
}
