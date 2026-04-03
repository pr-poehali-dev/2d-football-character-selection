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

// ===================== GAME (Physics engine) =====================

// Physics constants
const FIELD_W = 800;
const FIELD_H = 460;
const PLAYER_R = 22;
const BALL_R = 14;
const GOAL_W = 18;
const GOAL_H = 120;
const GOAL_Y = (FIELD_H - GOAL_H) / 2;

interface Vec2 { x: number; y: number }
interface PhysPlayer { x: number; y: number; vx: number; vy: number; kickCooldown: number; facing: number }
interface PhysBall { x: number; y: number; vx: number; vy: number; spin: number }

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function dist(a: Vec2, b: Vec2) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }

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
  const DURATION = 120; // seconds

  // Physics state (mutable refs for 60fps loop)
  const p1Ref = useRef<PhysPlayer>({ x: FIELD_W * 0.25, y: FIELD_H / 2, vx: 0, vy: 0, kickCooldown: 0, facing: 1 });
  const p2Ref = useRef<PhysPlayer>({ x: FIELD_W * 0.75, y: FIELD_H / 2, vx: 0, vy: 0, kickCooldown: 0, facing: -1 });
  const ballRef = useRef<PhysBall>({ x: FIELD_W / 2, y: FIELD_H / 2, vx: 0, vy: 0, spin: 0 });

  // React display state (updated ~30fps)
  const [display, setDisplay] = useState({
    p1: { x: FIELD_W * 0.25, y: FIELD_H / 2, facing: 1 },
    p2: { x: FIELD_W * 0.75, y: FIELD_H / 2, facing: -1 },
    ball: { x: FIELD_W / 2, y: FIELD_H / 2, spin: 0 },
    score1: 0, score2: 0, time: 0,
    possession: 50,
  });

  const [showGoal, setShowGoal] = useState(false);
  const [goalTeam, setGoalTeam] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [ticker, setTicker] = useState("Мяч в игре! Жми стрелки! 🚀");
  const [scoreAnim, setScoreAnim] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const scoreRef = useRef({ s1: 0, s2: 0 });
  const timeRef = useRef(0);
  const eventsRef = useRef<string[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const goalLockRef = useRef(false);
  const doneRef = useRef(false);
  const pausedRef = useRef(false);
  pausedRef.current = isPaused;

  // Keyboard listeners
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      // Prevent page scroll on arrows/space
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space","KeyW","KeyS","KeyA","KeyD"].includes(e.code)) {
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.code);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  const resetPositions = useCallback(() => {
    p1Ref.current = { x: FIELD_W * 0.25, y: FIELD_H / 2, vx: 0, vy: 0, kickCooldown: 0, facing: 1 };
    p2Ref.current = { x: FIELD_W * 0.75, y: FIELD_H / 2, vx: 0, vy: 0, kickCooldown: 0, facing: -1 };
    ballRef.current = { x: FIELD_W / 2, y: FIELD_H / 2, vx: 0, vy: 0, spin: 0 };
  }, []);

  // Main physics loop
  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;
    let displayTimer = 0;
    let gameTimer = 0;

    const tick = (now: number) => {
      const rawDt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!pausedRef.current && !doneRef.current) {
        const dt = rawDt;

        // ---- Player speeds from stats ----
        const spd1 = 120 + char1.speed * 22;
        const spd2 = 120 + char2.speed * 22;
        const kick1 = 280 + char1.power * 30;
        const kick2 = 280 + char2.power * 30;

        const p1 = p1Ref.current;
        const p2 = p2Ref.current;
        const ball = ballRef.current;
        const keys = keysRef.current;

        // ---- P1 input: WASD + F/Space to kick ----
        let ax1 = 0, ay1 = 0;
        if (keys.has("KeyA")) ax1 = -1;
        if (keys.has("KeyD")) ax1 = 1;
        if (keys.has("KeyW")) ay1 = -1;
        if (keys.has("KeyS")) ay1 = 1;
        // vs-bot: also allow arrow keys for single player
        if (mode === "vs-bot") {
          if (keys.has("ArrowLeft")) ax1 = -1;
          if (keys.has("ArrowRight")) ax1 = 1;
          if (keys.has("ArrowUp")) ay1 = -1;
          if (keys.has("ArrowDown")) ay1 = 1;
        }
        const kick1Key = keys.has("KeyF") || keys.has("Space");

        // ---- P2 input (vs-player: arrows+Enter, vs-bot: AI) ----
        let ax2 = 0, ay2 = 0;
        let kick2Key = false;
        if (mode === "vs-player") {
          if (keys.has("ArrowLeft")) ax2 = -1;
          if (keys.has("ArrowRight")) ax2 = 1;
          if (keys.has("ArrowUp")) ay2 = -1;
          if (keys.has("ArrowDown")) ay2 = 1;
          kick2Key = keys.has("Enter") || keys.has("Numpad0") || keys.has("Slash");
        } else {
          // Bot AI: chase ball, kick when close
          const botSpeedFactor = 0.72 + (10 - char2.agility) * 0.015;
          const tx = ball.x > FIELD_W * 0.55 ? ball.x : FIELD_W * 0.65;
          const ty = ball.y;
          ax2 = clamp((tx - p2.x) * 3, -1, 1) * botSpeedFactor;
          ay2 = clamp((ty - p2.y) * 3, -1, 1) * botSpeedFactor;
          kick2Key = dist(p2, ball) < PLAYER_R + BALL_R + 10;
        }

        // ---- Apply movement ----
        const FRICTION = 0.82;
        p1.vx = (p1.vx + ax1 * spd1 * dt) * FRICTION;
        p1.vy = (p1.vy + ay1 * spd1 * dt) * FRICTION;
        p2.vx = (p2.vx + ax2 * spd2 * dt) * FRICTION;
        p2.vy = (p2.vy + ay2 * spd2 * dt) * FRICTION;

        // Facing direction
        if (Math.abs(p1.vx) > 5) p1.facing = p1.vx > 0 ? 1 : -1;
        if (Math.abs(p2.vx) > 5) p2.facing = p2.vx > 0 ? 1 : -1;

        // Move players
        p1.x = clamp(p1.x + p1.vx * dt, PLAYER_R, FIELD_W - PLAYER_R);
        p1.y = clamp(p1.y + p1.vy * dt, PLAYER_R, FIELD_H - PLAYER_R);
        p2.x = clamp(p2.x + p2.vx * dt, PLAYER_R, FIELD_W - PLAYER_R);
        p2.y = clamp(p2.y + p2.vy * dt, PLAYER_R, FIELD_H - PLAYER_R);

        // Player collision
        const pdist = dist(p1, p2);
        if (pdist < PLAYER_R * 2) {
          const overlap = PLAYER_R * 2 - pdist;
          const nx = (p2.x - p1.x) / (pdist || 1);
          const ny = (p2.y - p1.y) / (pdist || 1);
          p1.x -= nx * overlap * 0.5;
          p1.y -= ny * overlap * 0.5;
          p2.x += nx * overlap * 0.5;
          p2.y += ny * overlap * 0.5;
          const bounce = 0.3;
          p1.vx -= nx * bounce * 100;
          p2.vx += nx * bounce * 100;
        }

        // ---- Ball physics ----
        const BALL_FRICTION = 0.975;
        ball.vx *= BALL_FRICTION;
        ball.vy *= BALL_FRICTION;
        ball.spin *= 0.97;
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        // Wall bounces
        if (ball.x - BALL_R < GOAL_W) {
          if (ball.y > GOAL_Y && ball.y < GOAL_Y + GOAL_H) {
            // Left goal: team2 scores
            if (!goalLockRef.current) {
              goalLockRef.current = true;
              scoreRef.current.s2++;
              const msg = `⚽ ГООООЛ! ${char2.name} забивает! (${scoreRef.current.s1}:${scoreRef.current.s2})`;
              eventsRef.current.push(msg);
              setShowGoal(true); setGoalTeam(2); setConfetti(true); setScoreAnim(true);
              setTimeout(() => { setShowGoal(false); setConfetti(false); setScoreAnim(false); goalLockRef.current = false; resetPositions(); }, 2600);
            }
          } else {
            ball.vx = Math.abs(ball.vx) * 0.7;
            ball.x = GOAL_W + BALL_R;
          }
        }
        if (ball.x + BALL_R > FIELD_W - GOAL_W) {
          if (ball.y > GOAL_Y && ball.y < GOAL_Y + GOAL_H) {
            // Right goal: team1 scores
            if (!goalLockRef.current) {
              goalLockRef.current = true;
              scoreRef.current.s1++;
              const msg = `⚽ ГООООЛ! ${char1.name} забивает! (${scoreRef.current.s1}:${scoreRef.current.s2})`;
              eventsRef.current.push(msg);
              setShowGoal(true); setGoalTeam(1); setConfetti(true); setScoreAnim(true);
              setTimeout(() => { setShowGoal(false); setConfetti(false); setScoreAnim(false); goalLockRef.current = false; resetPositions(); }, 2600);
            }
          } else {
            ball.vx = -Math.abs(ball.vx) * 0.7;
            ball.x = FIELD_W - GOAL_W - BALL_R;
          }
        }
        if (ball.y - BALL_R < 0) { ball.vy = Math.abs(ball.vy) * 0.7; ball.y = BALL_R; }
        if (ball.y + BALL_R > FIELD_H) { ball.vy = -Math.abs(ball.vy) * 0.7; ball.y = FIELD_H - BALL_R; }

        // Player-ball collision & kick
        for (const [player, kickKey, kickPow, dir] of [
          [p1, kick1Key, kick1, 1] as [PhysPlayer, boolean, number, number],
          [p2, kick2Key, kick2, -1] as [PhysPlayer, boolean, number, number],
        ]) {
          const d = dist(player, ball);
          if (d < PLAYER_R + BALL_R) {
            const nx = (ball.x - player.x) / (d || 1);
            const ny = (ball.y - player.y) / (d || 1);
            const overlap = PLAYER_R + BALL_R - d;
            ball.x += nx * overlap;
            ball.y += ny * overlap;
            const relV = (ball.vx - player.vx) * nx + (ball.vy - player.vy) * ny;
            if (relV < 0) {
              ball.vx -= relV * nx * 1.3;
              ball.vy -= relV * ny * 1.3;
            }
            if (kickKey && player.kickCooldown <= 0) {
              const kx = nx + (Math.random() - 0.5) * 0.3;
              const ky = ny + (Math.random() - 0.5) * 0.4;
              const km = Math.sqrt(kx * kx + ky * ky);
              ball.vx = (kx / km) * kickPow;
              ball.vy = (ky / km) * kickPow * 0.6;
              ball.spin = dir * kickPow * 0.01;
              player.kickCooldown = 0.3;
            }
          }
          player.kickCooldown = Math.max(0, player.kickCooldown - dt);
        }

        // Game timer
        gameTimer += dt;
        if (gameTimer >= 1) {
          gameTimer -= 1;
          timeRef.current++;

          if (timeRef.current % 9 === 0) {
            const evt = MATCH_EVENTS_POOL[Math.floor(Math.random() * MATCH_EVENTS_POOL.length)];
            eventsRef.current.push(`${timeRef.current}'  ${evt}`);
            setTicker(evt);
            setTimeout(() => setTicker("Жми! Стрелки/WASD — движение, Пробел/F — удар!"), 3500);
          }

          if (timeRef.current >= DURATION) {
            doneRef.current = true;
            setTimeout(() => onFinish(scoreRef.current.s1, scoreRef.current.s2, eventsRef.current), 400);
          }
        }

        // Possession (who's closer to ball)
        const d1 = dist(p1, ball);
        const d2 = dist(p2, ball);
        const poss = Math.round((d2 / (d1 + d2 + 0.01)) * 100);

        // Update display ~30fps
        displayTimer += dt;
        if (displayTimer > 0.033) {
          displayTimer = 0;
          setDisplay({
            p1: { x: p1.x, y: p1.y, facing: p1.facing },
            p2: { x: p2.x, y: p2.y, facing: p2.facing },
            ball: { x: ball.x, y: ball.y, spin: ball.spin },
            score1: scoreRef.current.s1,
            score2: scoreRef.current.s2,
            time: timeRef.current,
            possession: poss,
          });
        }
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [char1, char2, mode, resetPositions, onFinish]);

  const progress = (display.time / DURATION) * 100;
  const ballRotation = ballRef.current.spin * 20;

  // Scale for responsive display
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      setScale(Math.min(width / FIELD_W, height / FIELD_H));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
        <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0" style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(4px)" }}>
          <div className="flex items-center gap-2">
            <div className="rounded-lg overflow-hidden flex-shrink-0" style={{ width: 34, height: 34, border: `2px solid ${char1.color}` }}>
              <img src={char1.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-fredoka text-white text-sm leading-none">{char1.name}</div>
              <div className="font-nunito text-xs opacity-70" style={{ color: char1.color }}>
                WASD + F/Пробел
              </div>
            </div>
          </div>

          <div className="text-center">
            <div
              className={`font-fredoka text-4xl leading-none ${scoreAnim ? "animate-score-pop" : ""}`}
              style={{ color: "#FFD700", textShadow: "3px 3px 0 rgba(0,0,0,0.5)" }}
            >
              {display.score1} : {display.score2}
            </div>
            <div className="font-nunito text-xs text-gray-400">{display.time}' / {DURATION}'</div>
          </div>

          <div className="flex items-center gap-2 flex-row-reverse">
            <div className="rounded-lg overflow-hidden flex-shrink-0" style={{ width: 34, height: 34, border: `2px solid ${char2.color}` }}>
              <img src={char2.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="text-right">
              <div className="font-fredoka text-white text-sm leading-none">{char2.name}</div>
              <div className="font-nunito text-xs opacity-70" style={{ color: char2.color }}>
                {mode === "vs-player" ? "← → ↑ ↓ + Enter" : "🤖 Бот ИИ"}
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1.5 flex-shrink-0" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${char1.color}, #FFD700, ${char2.color})` }} />
        </div>

        {/* Physics field */}
        <div ref={containerRef} className="flex-1 relative overflow-hidden flex items-center justify-center">
          <div
            style={{
              width: FIELD_W,
              height: FIELD_H,
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              position: "relative",
              flexShrink: 0,
            }}
          >
            {/* Field markings */}
            <div style={{ position: "absolute", inset: 0 }}>
              {/* Center circle */}
              <div style={{ position: "absolute", top: FIELD_H / 2 - 65, left: FIELD_W / 2 - 65, width: 130, height: 130, border: "2px solid rgba(255,255,255,0.3)", borderRadius: "50%" }} />
              <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 2, background: "rgba(255,255,255,0.25)" }} />
              {/* Goal boxes */}
              <div style={{ position: "absolute", top: GOAL_Y - 20, left: 0, width: GOAL_W + 40, height: GOAL_H + 40, border: "2px solid rgba(255,255,255,0.25)", borderLeft: "none" }} />
              <div style={{ position: "absolute", top: GOAL_Y - 20, right: 0, width: GOAL_W + 40, height: GOAL_H + 40, border: "2px solid rgba(255,255,255,0.25)", borderRight: "none" }} />
            </div>

            {/* Left goal posts */}
            <div style={{ position: "absolute", left: 0, top: GOAL_Y, width: GOAL_W, height: GOAL_H, background: "rgba(255,255,255,0.15)", border: "3px solid white", borderLeft: "none", borderRadius: "0 6px 6px 0" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)" }} />
            </div>
            {/* Right goal posts */}
            <div style={{ position: "absolute", right: 0, top: GOAL_Y, width: GOAL_W, height: GOAL_H, background: "rgba(255,255,255,0.15)", border: "3px solid white", borderRight: "none", borderRadius: "6px 0 0 6px" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)" }} />
            </div>

            {/* Shadow under ball */}
            <div style={{
              position: "absolute",
              left: display.ball.x - 14,
              top: display.ball.y + 8,
              width: 28,
              height: 10,
              background: "rgba(0,0,0,0.25)",
              borderRadius: "50%",
              filter: "blur(3px)",
            }} />

            {/* Ball */}
            <div
              style={{
                position: "absolute",
                left: display.ball.x - BALL_R,
                top: display.ball.y - BALL_R,
                width: BALL_R * 2,
                height: BALL_R * 2,
                fontSize: BALL_R * 2,
                lineHeight: 1,
                transform: `rotate(${ballRotation}deg)`,
                filter: "drop-shadow(1px 3px 3px rgba(0,0,0,0.35))",
                userSelect: "none",
              }}
            >
              ⚽
            </div>

            {/* Player 1 */}
            <div
              style={{
                position: "absolute",
                left: display.p1.x - PLAYER_R,
                top: display.p1.y - PLAYER_R,
                width: PLAYER_R * 2,
                height: PLAYER_R * 2,
                transform: display.p1.facing < 0 ? "scaleX(-1)" : "scaleX(1)",
              }}
            >
              <div style={{
                width: "100%", height: "100%",
                borderRadius: "50%",
                overflow: "hidden",
                border: `3px solid ${char1.color}`,
                boxShadow: `0 0 8px ${char1.color}88, 2px 2px 0 #1a1a1a`,
              }}>
                <img src={char1.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              {/* Name tag */}
              <div style={{ position: "absolute", bottom: -18, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "white", fontFamily: "'Fredoka One',cursive", whiteSpace: "nowrap", textShadow: "1px 1px 0 #000" }}>
                {char1.name}
              </div>
            </div>

            {/* Player 2 */}
            <div
              style={{
                position: "absolute",
                left: display.p2.x - PLAYER_R,
                top: display.p2.y - PLAYER_R,
                width: PLAYER_R * 2,
                height: PLAYER_R * 2,
                transform: display.p2.facing < 0 ? "scaleX(-1)" : "scaleX(1)",
              }}
            >
              <div style={{
                width: "100%", height: "100%",
                borderRadius: "50%",
                overflow: "hidden",
                border: `3px solid ${char2.color}`,
                boxShadow: `0 0 8px ${char2.color}88, -2px 2px 0 #1a1a1a`,
              }}>
                <img src={char2.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ position: "absolute", bottom: -18, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "white", fontFamily: "'Fredoka One',cursive", whiteSpace: "nowrap", textShadow: "1px 1px 0 #000" }}>
                {char2.name}
              </div>
            </div>
          </div>
        </div>

        {/* Controls hint + ticker */}
        <div className="px-3 py-1.5 flex-shrink-0" style={{ background: "rgba(0,0,0,0.82)" }}>
          {/* Possession */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-nunito text-xs" style={{ color: char1.color, minWidth: 60 }}>{display.possession}%</span>
            <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.15)", borderRadius: 999 }}>
              <div style={{ width: `${display.possession}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${char1.color}, ${char2.color})`, transition: "width 0.2s" }} />
            </div>
            <span className="font-nunito text-xs" style={{ color: char2.color, minWidth: 60, textAlign: "right" }}>{100 - display.possession}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-base">📢</span>
            <span className="font-nunito text-xs text-white flex-1 animate-fade-in" key={ticker} style={{ textShadow: "1px 1px 0 #000" }}>{ticker}</span>
            <button
              className="btn-cartoon rounded-lg px-2 py-1 font-fredoka text-xs"
              style={{ background: isPaused ? "#4ade80" : "#f59e0b", color: "#1a1a1a" }}
              onClick={() => setIsPaused(p => !p)}
            >
              {isPaused ? "▶ Играть" : "⏸ Пауза"}
            </button>
            <button
              className="btn-cartoon rounded-lg px-2 py-1 font-fredoka text-xs"
              style={{ background: "#4361ee", color: "white" }}
              onClick={() => onStats(scoreRef.current.s1, scoreRef.current.s2, eventsRef.current)}
            >
              📊
            </button>
            <button
              className="btn-cartoon rounded-lg px-2 py-1 font-fredoka text-xs"
              style={{ background: "#FFD700", color: "#1a1a1a" }}
              onClick={() => onFinish(scoreRef.current.s1, scoreRef.current.s2, eventsRef.current)}
            >
              Финал
            </button>
          </div>
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