import { useState, useEffect, useRef, useCallback } from "react";

// ===================== TYPES =====================
type Screen = "menu" | "select" | "select2" | "mode" | "game" | "stats" | "result";
type GameMode = "vs-bot" | "vs-player";

interface Character {
  id: number;
  name: string;
  emoji: string;
  image: string;
  color: string;
  bgColor: string;
  speed: number;
  power: number;
  agility: number;
  description: string;
}

interface GameState {
  score1: number;
  score2: number;
  time: number;
  events: string[];
  possession: number;
}

// ===================== DATA =====================
const CHARACTERS: Character[] = [
  {
    id: 1,
    name: "Бомбардир",
    emoji: "💪",
    image: "https://cdn.poehali.dev/projects/4e3dc660-92ed-4a30-85f0-dad3a4af0b41/files/75687baa-645b-4932-bcea-0fe2832b891f.jpg",
    color: "#e63946",
    bgColor: "#fff5f5",
    speed: 3,
    power: 9,
    agility: 4,
    description: "Бьёт как пушка! Медленный, но страшный в штрафной",
  },
  {
    id: 2,
    name: "Молния",
    emoji: "⚡",
    image: "https://cdn.poehali.dev/projects/4e3dc660-92ed-4a30-85f0-dad3a4af0b41/files/06692377-9474-4aa4-b8e7-ac46fce2a85c.jpg",
    color: "#4361ee",
    bgColor: "#f0f4ff",
    speed: 10,
    power: 5,
    agility: 7,
    description: "Никто не догонит! Обводит всех своими молниеносными ногами",
  },
  {
    id: 3,
    name: "Осьминог",
    emoji: "🧤",
    image: "https://cdn.poehali.dev/projects/4e3dc660-92ed-4a30-85f0-dad3a4af0b41/files/cf03c60d-37fc-433c-b7d8-907d2a332e82.jpg",
    color: "#f4a261",
    bgColor: "#fff8f0",
    speed: 5,
    power: 6,
    agility: 10,
    description: "Руки везде! Вратарь-легенда с рефлексами кошки",
  },
  {
    id: 4,
    name: "Бульдозер",
    emoji: "🔥",
    image: "https://cdn.poehali.dev/projects/4e3dc660-92ed-4a30-85f0-dad3a4af0b41/files/c786cb71-a616-41b9-a35f-3abb18a4fbb2.jpg",
    color: "#7209b7",
    bgColor: "#f8f0ff",
    speed: 6,
    power: 8,
    agility: 6,
    description: "Снесёт любого защитника! Сбалансированный боец",
  },
];

const MATCH_EVENTS_POOL = [
  "Гениальный дриблинг! 🎩",
  "Шикарный пас! 👏",
  "Красавчик! ⭐",
  "Пушечный удар! 💥",
  "Мастерский финт! 🕺",
  "Фантастический рывок! 🚀",
  "Ой, подскользнулся! 😅",
  "Мяч улетел на трибуны! 😂",
  "Ногу свело! 🤕",
  "Напряжение нарастает!",
  "Болельщики в экстазе!",
  "Никто не хочет уступать!",
  "Судья смотрит в другую сторону!",
  "Тренер кусает ногти на скамейке!",
];

// ===================== HELPER COMPONENTS =====================

function StatBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mt-0.5">
      <div
        className="h-2 rounded-full transition-all duration-700"
        style={{ width: `${value * 10}%`, backgroundColor: color }}
      />
    </div>
  );
}

function Confetti() {
  const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: `${(i / 28) * 100}%`,
    delay: `${(i % 7) * 0.15}s`,
    duration: `${1.6 + (i % 5) * 0.2}s`,
    size: `${8 + (i % 5) * 3}px`,
    round: i % 3 !== 0,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.round ? "50%" : "2px",
            animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

function FieldBg({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: "linear-gradient(180deg, #87CEEB 0%, #b8e4f7 38%, #2d7a22 38%)" }}
    >
      {/* Sun */}
      <div
        className="absolute top-4 right-8 animate-float"
        style={{
          width: 56,
          height: 56,
          background: "radial-gradient(circle, #FFD700, #FFA500)",
          borderRadius: "50%",
          border: "3px solid #1a1a1a",
          boxShadow: "0 0 18px rgba(255,215,0,0.5)",
        }}
      />
      {/* Clouds */}
      <div className="absolute top-5 left-8 animate-float" style={{ animationDelay: "0.4s" }}>
        <div style={{ width: 70, height: 26, background: "white", borderRadius: 20, border: "2px solid #e0e0e0", opacity: 0.9 }} />
      </div>
      <div className="absolute top-9 left-1/3 animate-float" style={{ animationDelay: "1.1s" }}>
        <div style={{ width: 50, height: 20, background: "white", borderRadius: 15, border: "2px solid #e0e0e0", opacity: 0.8 }} />
      </div>
      {/* Field */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "63%", background: "#2d7a22" }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0"
            style={{ left: `${i * 16.67}%`, width: "16.67%", background: i % 2 === 0 ? "rgba(0,0,0,0.04)" : "transparent" }}
          />
        ))}
        <div className="absolute" style={{ top: "28%", left: "50%", transform: "translateX(-50%)", width: 110, height: 110, border: "2px solid rgba(255,255,255,0.25)", borderRadius: "50%" }} />
        <div className="absolute" style={{ top: 0, bottom: 0, left: "50%", width: 2, background: "rgba(255,255,255,0.25)" }} />
        <div className="absolute" style={{ top: "22%", left: 0, width: 44, height: "56%", border: "2px solid rgba(255,255,255,0.25)", borderLeft: "none" }} />
        <div className="absolute" style={{ top: "22%", right: 0, width: 44, height: "56%", border: "2px solid rgba(255,255,255,0.25)", borderRight: "none" }} />
      </div>
      {children}
    </div>
  );
}

// ===================== MENU =====================
function MenuScreen({ onStart }: { onStart: () => void }) {
  return (
    <FieldBg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-4">
        <div className="animate-pop-in text-center">
          <div
            className="font-fredoka leading-none"
            style={{
              fontSize: "clamp(52px, 14vw, 96px)",
              color: "#FFD700",
              textShadow: "4px 4px 0px #e63946, 8px 8px 0px rgba(0,0,0,0.25)",
              WebkitTextStroke: "2px #1a1a1a",
            }}
          >
            ФутбоЛОЛ!
          </div>
          <div
            className="font-fredoka text-xl mt-1"
            style={{ color: "white", textShadow: "2px 2px 0 #1a1a1a" }}
          >
            ⚽ Самый смешной футбол! ⚽
          </div>
        </div>

        <div className="flex gap-3 animate-slide-in-up" style={{ animationDelay: "0.15s", opacity: 0, animationFillMode: "forwards" }}>
          {CHARACTERS.map((c, i) => (
            <div
              key={c.id}
              className="animate-bounce-fun"
              style={{
                animationDelay: `${i * 0.25}s`,
                width: 65,
                height: 65,
                borderRadius: 14,
                border: "3px solid #1a1a1a",
                overflow: "hidden",
                boxShadow: "3px 3px 0 #1a1a1a",
                background: c.bgColor,
              }}
            >
              <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="btn-cartoon font-fredoka rounded-2xl animate-slide-in-up"
          style={{
            fontSize: "clamp(22px, 5vw, 32px)",
            padding: "12px 48px",
            background: "linear-gradient(135deg, #FFD700, #FFA500)",
            color: "#1a1a1a",
            animationDelay: "0.3s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          ИГРАТЬ! 🎮
        </button>

        <div className="absolute bottom-6 left-6 text-5xl animate-spin-ball" style={{ animationDuration: "3s" }}>⚽</div>
        <div className="absolute bottom-14 right-10 text-4xl animate-float" style={{ animationDelay: "1.2s" }}>🏆</div>
        <div className="absolute top-1/3 left-3 text-3xl animate-float" style={{ animationDelay: "0.6s" }}>🎉</div>
      </div>
    </FieldBg>
  );
}

// ===================== SELECT =====================
function SelectScreen({
  selectedId,
  onSelect,
  label,
  onConfirm,
  onBack,
  confirmLabel,
}: {
  selectedId: number | null;
  onSelect: (id: number) => void;
  label: string;
  onConfirm: () => void;
  onBack: () => void;
  confirmLabel: string;
}) {
  return (
    <FieldBg>
      <div className="absolute inset-0 flex flex-col items-center pt-3 px-3 gap-3 overflow-y-auto hide-scroll">
        <h2
          className="font-fredoka text-4xl animate-pop-in"
          style={{ color: "#FFD700", textShadow: "3px 3px 0 #1a1a1a" }}
        >
          {label}
        </h2>

        <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
          {CHARACTERS.map((c, i) => (
            <div
              key={c.id}
              className={`char-card card-cartoon rounded-2xl overflow-hidden animate-slide-in-up cursor-pointer ${selectedId === c.id ? "selected" : ""}`}
              style={{
                background: c.bgColor,
                animationDelay: `${i * 0.08}s`,
                opacity: 0,
                animationFillMode: "forwards",
              }}
              onClick={() => onSelect(c.id)}
            >
              <div className="flex items-center gap-2 p-3">
                <div
                  className="rounded-xl overflow-hidden flex-shrink-0"
                  style={{ width: 68, height: 68, border: "2px solid #1a1a1a" }}
                >
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-fredoka text-base leading-tight" style={{ color: c.color }}>
                    {c.emoji} {c.name}
                  </div>
                  <div className="text-xs text-gray-500 mb-1 leading-tight">{c.description.slice(0, 38)}…</div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-xs w-12 text-gray-500">⚡ Скорость</span>
                      <StatBar value={c.speed} color="#4361ee" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs w-12 text-gray-500">💥 Удар</span>
                      <StatBar value={c.power} color="#e63946" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs w-12 text-gray-500">🧤 Ловкость</span>
                      <StatBar value={c.agility} color="#2d6a4f" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pb-4">
          <button
            onClick={onBack}
            className="btn-cartoon font-fredoka text-lg px-6 py-2 rounded-xl"
            style={{ background: "#f8f9fa", color: "#1a1a1a" }}
          >
            ← Назад
          </button>
          <button
            onClick={onConfirm}
            disabled={!selectedId}
            className="btn-cartoon font-fredoka text-lg px-8 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: selectedId ? "linear-gradient(135deg, #FFD700, #FFA500)" : "#ccc",
              color: "#1a1a1a",
            }}
          >
            {confirmLabel} →
          </button>
        </div>
      </div>
    </FieldBg>
  );
}

// ===================== MODE =====================
function ModeScreen({ onSelect, onBack }: { onSelect: (m: GameMode) => void; onBack: () => void }) {
  return (
    <FieldBg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-4">
        <div className="animate-pop-in text-center">
          <h2 className="font-fredoka text-5xl" style={{ color: "#FFD700", textShadow: "3px 3px 0 #1a1a1a" }}>
            Выбери режим!
          </h2>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            onClick={() => onSelect("vs-bot")}
            className="btn-cartoon rounded-2xl p-5 text-left animate-slide-in-left"
            style={{ background: "linear-gradient(135deg, #4361ee, #3a0ca3)", color: "white", opacity: 0, animationFillMode: "forwards" }}
          >
            <div className="font-fredoka text-3xl mb-1">🤖 Против бота</div>
            <div className="font-nunito text-sm opacity-80">Сыграй против умного (и немного читерящего) компьютера!</div>
          </button>

          <button
            onClick={() => onSelect("vs-player")}
            className="btn-cartoon rounded-2xl p-5 text-left animate-slide-in-right"
            style={{ background: "linear-gradient(135deg, #e63946, #c1121f)", color: "white", animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}
          >
            <div className="font-fredoka text-3xl mb-1">👥 Вдвоём</div>
            <div className="font-nunito text-sm opacity-80">Сразись с другом на одном устройстве! Кто круче?</div>
          </button>
        </div>

        <button
          onClick={onBack}
          className="btn-cartoon font-fredoka text-lg px-6 py-2 rounded-xl animate-slide-in-up"
          style={{ background: "#f8f9fa", color: "#1a1a1a", animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}
        >
          ← Назад
        </button>
      </div>
    </FieldBg>
  );
}

// ===================== GAME =====================
function GameScreen({
  char1Id,
  char2Id,
  mode,
  onFinish,
  onStats,
}: {
  char1Id: number;
  char2Id: number;
  mode: GameMode;
  onFinish: (s1: number, s2: number, events: string[]) => void;
  onStats: (s1: number, s2: number, events: string[]) => void;
}) {
  const char1 = CHARACTERS.find((c) => c.id === char1Id)!;
  const char2 = CHARACTERS.find((c) => c.id === char2Id)!;
  const DURATION = 90;

  const [gs, setGs] = useState<GameState>({ score1: 0, score2: 0, time: 0, events: [], possession: 50 });
  const [ticker, setTicker] = useState("Мяч в игре! Поехали! 🚀");
  const [showGoal, setShowGoal] = useState(false);
  const [goalTeam, setGoalTeam] = useState(0);
  const [ballPos, setBallPos] = useState(50);
  const [confetti, setConfetti] = useState(false);
  const [scoreAnim, setScoreAnim] = useState(false);

  const gsRef = useRef(gs);
  gsRef.current = gs;
  const eventsRef = useRef<string[]>([]);
  const doneRef = useRef(false);

  const triggerGoal = useCallback((team: number) => {
    const scorer = team === 1 ? char1.name : char2.name;
    const msg = `⚽ ГООООЛ! ${scorer} забивает!`;
    eventsRef.current = [...eventsRef.current, msg];
    setShowGoal(true);
    setGoalTeam(team);
    setConfetti(true);
    setScoreAnim(true);
    setBallPos(50);
    setTimeout(() => { setShowGoal(false); setConfetti(false); setScoreAnim(false); }, 2600);
    setGs((prev) => ({
      ...prev,
      score1: team === 1 ? prev.score1 + 1 : prev.score1,
      score2: team === 2 ? prev.score2 + 1 : prev.score2,
      events: eventsRef.current,
    }));
  }, [char1.name, char2.name]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (doneRef.current) return;

      setGs((prev) => {
        const newTime = prev.time + 1;

        if (newTime >= DURATION) {
          doneRef.current = true;
          clearInterval(interval);
          setTimeout(() => onFinish(gsRef.current.score1, gsRef.current.score2, eventsRef.current), 600);
          return { ...prev, time: newTime };
        }

        // Ball logic
        const r = Math.random();
        const p1str = (char1.speed + char1.power) / 20;
        const p2str = (char2.speed + char2.power) / 20;
        if (r < p1str * 0.06) setBallPos((b) => Math.max(8, b - Math.random() * 18));
        else if (r < p2str * 0.1) setBallPos((b) => Math.min(92, b + Math.random() * 18));

        const newPoss = Math.max(20, Math.min(80, prev.possession + (r < 0.5 ? 2 : -2)));

        // Event every 7 secs
        if (newTime % 7 === 0) {
          const evt = MATCH_EVENTS_POOL[Math.floor(Math.random() * MATCH_EVENTS_POOL.length)];
          const logLine = `${newTime}'  ${evt}`;
          eventsRef.current = [...eventsRef.current, logLine];
          setTicker(evt);
          setTimeout(() => setTicker("Мяч в игре! Жарко тут..."), 3500);
        }

        // Goal check
        const goalBase = 0.013;
        if (Math.random() < goalBase * (char1.power / 9)) {
          if (Math.random() > char2.agility / 14) triggerGoal(1);
        } else if (Math.random() < goalBase * (char2.power / 9)) {
          if (Math.random() > char1.agility / 14) triggerGoal(2);
        }

        return { ...prev, time: newTime, possession: newPoss, events: eventsRef.current };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [char1, char2, triggerGoal, onFinish]);

  const progress = (gs.time / DURATION) * 100;

  return (
    <FieldBg>
      {confetti && <Confetti />}

      {/* GOAL overlay */}
      {showGoal && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none" style={{ background: "rgba(0,0,0,0.52)" }}>
          <div
            className="font-fredoka text-center animate-pop-in"
            style={{
              color: goalTeam === 1 ? char1.color : char2.color,
              fontSize: "clamp(52px, 14vw, 100px)",
              textShadow: "0 0 30px rgba(255,215,0,0.8), 4px 4px 0 #1a1a1a",
              WebkitTextStroke: "2px #1a1a1a",
            }}
          >
            ГОООООЛ! ⚽
            <div className="font-nunito text-white" style={{ fontSize: "clamp(14px, 3.5vw, 24px)", textShadow: "2px 2px 0 #000" }}>
              {goalTeam === 1 ? char1.name : char2.name} забивает!
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 flex flex-col">
        {/* Scoreboard */}
        <div className="flex items-center justify-between px-3 py-2" style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(4px)" }}>
          <div className="flex items-center gap-2">
            <div className="rounded-lg overflow-hidden flex-shrink-0" style={{ width: 38, height: 38, border: `2px solid ${char1.color}` }}>
              <img src={char1.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-fredoka text-white text-sm leading-none">{char1.name}</div>
              <div className="font-nunito text-xs" style={{ color: char1.color }}>{mode === "vs-player" ? "Игрок 1" : "Ты"}</div>
            </div>
          </div>

          <div className="text-center">
            <div
              className={`font-fredoka text-4xl leading-none ${scoreAnim ? "animate-score-pop" : ""}`}
              style={{ color: "#FFD700", textShadow: "3px 3px 0 rgba(0,0,0,0.5)" }}
            >
              {gs.score1} : {gs.score2}
            </div>
            <div className="font-nunito text-xs text-gray-400">{gs.time}'</div>
          </div>

          <div className="flex items-center gap-2 flex-row-reverse">
            <div className="rounded-lg overflow-hidden flex-shrink-0" style={{ width: 38, height: 38, border: `2px solid ${char2.color}` }}>
              <img src={char2.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="text-right">
              <div className="font-fredoka text-white text-sm leading-none">{char2.name}</div>
              <div className="font-nunito text-xs" style={{ color: char2.color }}>{mode === "vs-player" ? "Игрок 2" : "Бот 🤖"}</div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1.5" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="h-full transition-all duration-1000" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${char1.color}, #FFD700, ${char2.color})` }} />
        </div>

        {/* Playing field */}
        <div className="flex-1 relative">
          {/* Goals */}
          <div className="absolute" style={{ left: 0, top: "28%", width: 18, height: "44%", background: "rgba(255,255,255,0.88)", border: "2px solid #1a1a1a", borderLeft: "none" }} />
          <div className="absolute" style={{ right: 0, top: "28%", width: 18, height: "44%", background: "rgba(255,255,255,0.88)", border: "2px solid #1a1a1a", borderRight: "none" }} />

          {/* Ball */}
          <div
            className="absolute"
            style={{
              left: `${ballPos}%`,
              top: "45%",
              transform: "translate(-50%,-50%)",
              fontSize: "clamp(22px,5vw,34px)",
              transition: "left 0.9s ease",
              filter: "drop-shadow(2px 4px 4px rgba(0,0,0,0.4))",
            }}
          >
            ⚽
          </div>

          {/* Player 1 */}
          <div className="absolute" style={{ left: `${Math.max(4, ballPos - 22)}%`, top: "40%", transform: "translate(-50%,-50%)", transition: "left 1.3s ease" }}>
            <div className="rounded-full overflow-hidden" style={{ width: 46, height: 46, border: `3px solid ${char1.color}`, boxShadow: "2px 2px 0 #1a1a1a" }}>
              <img src={char1.image} alt="" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Player 2 */}
          <div className="absolute" style={{ left: `${Math.min(96, ballPos + 22)}%`, top: "40%", transform: "translate(-50%,-50%) scaleX(-1)", transition: "left 1.3s ease" }}>
            <div className="rounded-full overflow-hidden" style={{ width: 46, height: 46, border: `3px solid ${char2.color}`, boxShadow: "-2px 2px 0 #1a1a1a" }}>
              <img src={char2.image} alt="" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Possession */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="font-nunito text-center text-white text-xs mb-1" style={{ textShadow: "1px 1px 0 #000" }}>Владение мячом</div>
            <div style={{ background: "rgba(0,0,0,0.45)", borderRadius: 999, height: 7, border: "1px solid rgba(255,255,255,0.25)" }}>
              <div className="h-full rounded-full transition-all duration-600" style={{ width: `${gs.possession}%`, background: `linear-gradient(90deg, ${char1.color}, ${char2.color})` }} />
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="px-3 py-2 flex items-center gap-2" style={{ background: "rgba(0,0,0,0.72)" }}>
          <span className="text-lg">📢</span>
          <span className="font-nunito text-sm text-white flex-1 animate-fade-in" key={ticker} style={{ textShadow: "1px 1px 0 #000" }}>
            {ticker}
          </span>
          <button
            className="btn-cartoon rounded-lg px-3 py-1 font-fredoka text-sm"
            style={{ background: "#4361ee", color: "white" }}
            onClick={() => onStats(gs.score1, gs.score2, eventsRef.current)}
          >
            📊
          </button>
          <button
            className="btn-cartoon rounded-lg px-3 py-1 font-fredoka text-sm"
            style={{ background: "#FFD700", color: "#1a1a1a" }}
            onClick={() => onFinish(gs.score1, gs.score2, eventsRef.current)}
          >
            Финал
          </button>
        </div>
      </div>
    </FieldBg>
  );
}

// ===================== STATS =====================
function StatsScreen({
  score1, score2, char1Id, char2Id, events, onBack, onFinish,
}: {
  score1: number; score2: number; char1Id: number; char2Id: number;
  events: string[]; onBack: () => void; onFinish: () => void;
}) {
  const char1 = CHARACTERS.find((c) => c.id === char1Id)!;
  const char2 = CHARACTERS.find((c) => c.id === char2Id)!;

  return (
    <FieldBg>
      <div className="absolute inset-0 flex flex-col items-center px-4 pt-3 gap-3 overflow-y-auto hide-scroll">
        <h2 className="font-fredoka text-4xl animate-pop-in" style={{ color: "#FFD700", textShadow: "3px 3px 0 #1a1a1a" }}>
          📊 Статистика
        </h2>

        {/* Score */}
        <div className="card-cartoon rounded-2xl p-4 w-full max-w-sm animate-slide-in-up" style={{ background: "rgba(0,0,0,0.72)" }}>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <img src={char1.image} alt="" className="w-14 h-14 rounded-xl mx-auto mb-1" style={{ border: `2px solid ${char1.color}` }} />
              <div className="font-fredoka text-white text-sm">{char1.name}</div>
            </div>
            <div className="font-fredoka text-6xl" style={{ color: "#FFD700", textShadow: "3px 3px 0 #000" }}>
              {score1}:{score2}
            </div>
            <div className="text-center">
              <img src={char2.image} alt="" className="w-14 h-14 rounded-xl mx-auto mb-1" style={{ border: `2px solid ${char2.color}` }} />
              <div className="font-fredoka text-white text-sm">{char2.name}</div>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="card-cartoon rounded-2xl p-4 w-full max-w-sm animate-slide-in-up" style={{ background: "rgba(255,255,255,0.96)", animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}>
          <div className="font-fredoka text-xl text-center mb-3 text-gray-800">Сравнение игроков</div>
          {[
            { label: "⚡ Скорость", v1: char1.speed, v2: char2.speed },
            { label: "💥 Удар", v1: char1.power, v2: char2.power },
            { label: "🧤 Ловкость", v1: char1.agility, v2: char2.agility },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-2 mb-2">
              <span className="font-fredoka text-lg w-7 text-center" style={{ color: char1.color }}>{row.v1}</span>
              <div className="flex-1">
                <div className="text-center font-nunito text-xs text-gray-500 mb-0.5">{row.label}</div>
                <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
                  <div style={{ flex: row.v1, background: char1.color }} />
                  <div style={{ flex: row.v2, background: char2.color }} />
                </div>
              </div>
              <span className="font-fredoka text-lg w-7 text-center" style={{ color: char2.color }}>{row.v2}</span>
            </div>
          ))}
        </div>

        {/* Events log */}
        <div
          className="card-cartoon rounded-2xl p-3 w-full max-w-sm animate-slide-in-up"
          style={{ background: "rgba(255,255,255,0.92)", animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards", maxHeight: 150, overflowY: "auto" }}
        >
          <div className="font-fredoka text-lg mb-2 text-gray-800">🎙 Репортаж матча</div>
          {events.length === 0 && <div className="font-nunito text-sm text-gray-400">Матч только начался!</div>}
          {events.slice(-8).map((e, i) => (
            <div key={i} className="font-nunito text-xs text-gray-600 py-0.5 border-b border-gray-100 last:border-0">{e}</div>
          ))}
        </div>

        <div className="flex gap-3 pb-4">
          <button onClick={onBack} className="btn-cartoon font-fredoka text-lg px-5 py-2 rounded-xl" style={{ background: "#f8f9fa", color: "#1a1a1a" }}>
            ← Матч
          </button>
          <button onClick={onFinish} className="btn-cartoon font-fredoka text-lg px-5 py-2 rounded-xl" style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)", color: "#1a1a1a" }}>
            Финальный свисток 🏆
          </button>
        </div>
      </div>
    </FieldBg>
  );
}

// ===================== RESULT =====================
function ResultScreen({
  score1, score2, char1Id, char2Id, mode, onRestart, onMenu,
}: {
  score1: number; score2: number; char1Id: number; char2Id: number;
  mode: GameMode; onRestart: () => void; onMenu: () => void;
}) {
  const char1 = CHARACTERS.find((c) => c.id === char1Id)!;
  const char2 = CHARACTERS.find((c) => c.id === char2Id)!;
  const draw = score1 === score2;
  const winner = score1 > score2 ? char1 : char2;
  const loser = score1 > score2 ? char2 : char1;

  const funnyMsgs = draw
    ? ["Ничья! Оба молодцы! 🤝", "Дружба победила! Настоящие джентльмены!"]
    : [`${winner.name} — легенда! ${loser.name} идёт плакать 😂`, `Такого разгрома стадион не видел давно!`];
  const msg = funnyMsgs[Math.floor(Math.random() * funnyMsgs.length)];

  return (
    <FieldBg>
      <Confetti />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 gap-5">
        <div className="animate-pop-in text-center">
          {draw ? (
            <div className="font-fredoka" style={{ fontSize: "clamp(44px,12vw,80px)", color: "#FFD700", textShadow: "4px 4px 0 #1a1a1a" }}>
              🤝 НИЧЬЯ! 🤝
            </div>
          ) : (
            <>
              <div className="font-fredoka text-2xl text-white" style={{ textShadow: "2px 2px 0 #1a1a1a" }}>ПОБЕДИТЕЛЬ!</div>
              <div className="font-fredoka" style={{ fontSize: "clamp(40px,11vw,72px)", color: "#FFD700", textShadow: "4px 4px 0 #1a1a1a" }}>
                {winner.emoji} {winner.name}!
              </div>
            </>
          )}
        </div>

        <div className="card-cartoon rounded-3xl p-5 w-full max-w-sm animate-slide-in-up" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div
                className={`rounded-2xl overflow-hidden mx-auto mb-2 ${!draw && winner.id === char1Id ? "animate-bounce-fun" : ""}`}
                style={{ width: 66, height: 66, border: `3px solid ${char1.color}`, boxShadow: !draw && winner.id === char1Id ? `0 0 18px ${char1.color}` : "none" }}
              >
                <img src={char1.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="font-fredoka text-white text-sm">{char1.name}</div>
              <div className="text-xl">{!draw ? (winner.id === char1Id ? "🏆" : "😭") : "🤝"}</div>
            </div>

            <div className="text-center">
              <div className="font-fredoka text-7xl leading-none" style={{ color: "#FFD700", textShadow: "3px 3px 0 #000" }}>
                {score1}:{score2}
              </div>
              <div className="font-nunito text-gray-400 text-xs mt-1">ФИНАЛ</div>
            </div>

            <div className="text-center">
              <div
                className={`rounded-2xl overflow-hidden mx-auto mb-2 ${!draw && winner.id === char2Id ? "animate-bounce-fun" : ""}`}
                style={{ width: 66, height: 66, border: `3px solid ${char2.color}`, boxShadow: !draw && winner.id === char2Id ? `0 0 18px ${char2.color}` : "none" }}
              >
                <img src={char2.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="font-fredoka text-white text-sm">{char2.name}{mode === "vs-bot" ? " 🤖" : ""}</div>
              <div className="text-xl">{!draw ? (winner.id === char2Id ? "🏆" : "😭") : "🤝"}</div>
            </div>
          </div>

          <div className="font-nunito text-center text-white text-sm mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.18)" }}>
            {msg}
          </div>
        </div>

        <div className="flex gap-3 animate-slide-in-up" style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}>
          <button onClick={onMenu} className="btn-cartoon font-fredoka text-lg px-5 py-2 rounded-xl" style={{ background: "#f8f9fa", color: "#1a1a1a" }}>
            🏠 Меню
          </button>
          <button onClick={onRestart} className="btn-cartoon font-fredoka text-xl px-6 py-2 rounded-xl" style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)", color: "#1a1a1a" }}>
            🔄 Ещё раз!
          </button>
        </div>
      </div>
    </FieldBg>
  );
}

// ===================== MAIN =====================
export default function Index() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [char1, setChar1] = useState<number | null>(null);
  const [char2, setChar2] = useState<number | null>(null);
  const [mode, setMode] = useState<GameMode>("vs-bot");
  const [matchData, setMatchData] = useState({ s1: 0, s2: 0, events: [] as string[] });

  const go = (s: Screen) => setScreen(s);

  const handleFinish = (s1: number, s2: number, events: string[]) => {
    setMatchData({ s1, s2, events });
    go("result");
  };

  const handleStats = (s1: number, s2: number, events: string[]) => {
    setMatchData({ s1, s2, events });
    go("stats");
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      {screen === "menu" && <MenuScreen onStart={() => go("select")} />}

      {screen === "select" && (
        <SelectScreen
          selectedId={char1}
          onSelect={setChar1}
          label="Выбери своего игрока!"
          onConfirm={() => go("mode")}
          onBack={() => go("menu")}
          confirmLabel="Выбрать режим"
        />
      )}

      {screen === "select2" && (
        <SelectScreen
          selectedId={char2}
          onSelect={setChar2}
          label="Игрок 2 — выбирай!"
          onConfirm={() => go("game")}
          onBack={() => go("mode")}
          confirmLabel="В бой!"
        />
      )}

      {screen === "mode" && (
        <ModeScreen
          onSelect={(m) => {
            setMode(m);
            if (m === "vs-player") {
              setChar2(null);
              go("select2");
            } else {
              const bot = CHARACTERS.find((c) => c.id !== char1) || CHARACTERS[1];
              setChar2(bot.id);
              go("game");
            }
          }}
          onBack={() => go("select")}
        />
      )}

      {screen === "game" && char1 && char2 && (
        <GameScreen char1Id={char1} char2Id={char2} mode={mode} onFinish={handleFinish} onStats={handleStats} />
      )}

      {screen === "stats" && char1 && char2 && (
        <StatsScreen
          score1={matchData.s1}
          score2={matchData.s2}
          char1Id={char1}
          char2Id={char2}
          events={matchData.events}
          onBack={() => go("game")}
          onFinish={() => handleFinish(matchData.s1, matchData.s2, matchData.events)}
        />
      )}

      {screen === "result" && char1 && char2 && (
        <ResultScreen
          score1={matchData.s1}
          score2={matchData.s2}
          char1Id={char1}
          char2Id={char2}
          mode={mode}
          onRestart={() => { setChar1(null); setChar2(null); go("select"); }}
          onMenu={() => { setChar1(null); setChar2(null); go("menu"); }}
        />
      )}
    </div>
  );
}
