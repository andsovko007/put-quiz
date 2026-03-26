import { useState, useEffect } from "react";

// ========== НАСТРОЙКИ ==========
// Замени на свои после создания бота через @BotFather
const TG_BOT_TOKEN = "YOUR_BOT_TOKEN";
const TG_CHAT_ID = "YOUR_CHAT_ID"; // Твой личный chat_id
const TG_LINK = "https://t.me/sovkoandrei";

// ========== ВОПРОСЫ ==========
const QUESTIONS = [
  {
    q: "Что сейчас болит сильнее всего?",
    opts: [
      { text: "Клиентов и заявок меньше, чем нужно", s: "money" },
      { text: "Деньги приходят нестабильно", s: "money" },
      { text: "Всё слишком завязано на мне", s: "me" },
      { text: "Постоянно перегружен и быстро устаю", s: "burnout" },
      { text: "Много делаю, а результата мало", s: "chaos" },
    ],
  },
  {
    q: "Что у тебя происходит чаще всего?",
    opts: [
      { text: "Без меня всё сразу проседает", s: "me" },
      { text: "Люди интересуются, но до покупки не доходят", s: "money" },
      { text: "В голове слишком много всего одновременно", s: "burnout" },
      { text: "Тушу текучку вместо важного", s: "chaos" },
      { text: "Контент идёт, а заявок почти нет", s: "money" },
    ],
  },
  {
    q: "Где ты чаще всего теряешь деньги?",
    opts: [
      { text: "Нет стабильного потока клиентов", s: "money" },
      { text: "Продажи завязаны на моё участие", s: "me" },
      { text: "Команда не разгружает, а добавляет хаоса", s: "me" },
      { text: "Время уходит в суету и переключения", s: "burnout" },
      { text: "Не понимаю, где именно у меня течёт", s: "chaos" },
    ],
  },
  {
    q: "На что похожа твоя типичная неделя?",
    opts: [
      { text: "Много движения, мало реального сдвига", s: "chaos" },
      { text: "Всё срочное, всё через меня", s: "me" },
      { text: "Даже на отдыхе голова в работе", s: "burnout" },
      { text: "Маркетинг сдвигается на потом", s: "money" },
      { text: "Устаю быстрее, чем двигаюсь вперёд", s: "burnout" },
    ],
  },
  {
    q: "Что уже пробовал, но не дало устойчивого результата?",
    opts: [
      { text: "Больше контента и рекламу", s: "money" },
      { text: "Новую упаковку или позиционирование", s: "money" },
      { text: "Дисциплину и силу воли", s: "burnout" },
      { text: "Делегирование или найм", s: "me" },
      { text: "Всё кусками, но системы так и нет", s: "chaos" },
    ],
  },
  {
    q: "Что выматывает сильнее всего?",
    opts: [
      { text: "Нет предсказуемости в клиентах и деньгах", s: "money" },
      { text: "Постоянно всё вытаскиваю сам", s: "me" },
      { text: "Не понимаю, что чинить первым", s: "chaos" },
      { text: "Голова забита, ясности всё меньше", s: "burnout" },
      { text: "Топчусь на месте, хотя много пробовал", s: "chaos" },
    ],
  },
  {
    q: "Что у тебя сейчас ближе к реальности?",
    qual: true,
    opts: [
      { text: "Свой бизнес / я собственник", s: "qual_a" },
      { text: "Эксперт, сам продаю свои услуги", s: "qual_a" },
      { text: "Руковожу командой или направлением", s: "qual_a" },
      { text: "Работаю один, на мне клиенты и деньги", s: "qual_b" },
      { text: "Собираю модель, хочу стабильный доход", s: "qual_c" },
    ],
  },
];

// ========== РЕЗУЛЬТАТЫ ==========
const RESULTS = {
  burnout: {
    tag: "ПЕРЕГРЕВ",
    color: "#FF6B4A",
    title: "Твой главный стопор — перегрев",
    subtitle: "Ты работаешь на остатках, и это уже стоит денег.",
    familiar: [
      "Встаёшь разбитый, кофе не помогает",
      "Голова ватная после обеда, решения кривые",
      "Срываешься на тех, кто не виноват",
      "В 3 ночи просыпаешься с мыслью о работе",
      "Тело посыпалось: спина, давление, сон",
      "Если выпадешь — всё реально встанет",
    ],
    tried: [
      ["Отдых", "но через день после отпуска всё вернулось"],
      ["Дисциплина", "но дисциплина на пустом баке = ещё больше перегрева"],
      ["Спорт", "но на него нет сил после рабочего дня"],
      ["«Просто потерпеть»", "но терпишь уже полгода, и становится хуже"],
    ],
    scenes: [
      "Слил переговоры на 500 тысяч, потому что голова была ватная. Не потому что не умею. Потому что сел на встречу на остатках.",
      "Ребёнок спросил: «Пап, мы сегодня поиграем?» А я не помню, когда последний раз был дома по-настоящему.",
      "Проснулся в 3 ночи с мыслью о кассе. Понял, что так уже полгода. И что это не пройдёт само.",
    ],
  },
  money: {
    tag: "НЕТ КЛИЕНТОВ И ДЕНЕГ",
    color: "#4AAFFF",
    title: "Твой главный стопор — дыра в потоке",
    subtitle: "Клиенты и деньги приходят случайно, а не системно.",
    familiar: [
      "Заявок то густо, то пусто — предсказуемости ноль",
      "Контент идёт, а на кассе тихо",
      "Люди интересуются, но до оплаты не доходят",
      "Много «подумаю» и мало денег",
      "Реклама не окупается, что работает — непонятно",
      "Каждый месяц как с нуля",
    ],
    tried: [
      ["Больше контента", "но контент без оффера = бесплатный блог"],
      ["Таргет и реклама", "но лить трафик в дырявую воронку = сливать бюджет"],
      ["Новая упаковка", "но красивая обёртка не чинит слабое предложение"],
      ["Скидки", "но скидка привлекает тех, кому не нужен результат"],
    ],
    scenes: [
      "За три месяца — 40 заявок, купили четверо. 36 ушли. И до сих пор не знаю, где именно они отваливаются.",
      "Вложил 200 тысяч в рекламу. Получил лайки и подписчиков. На кассе — ноль.",
      "Клиент написал «очень откликается, я подумаю». Думает третий месяц. И таких двадцать.",
    ],
  },
  me: {
    tag: "ВСЁ НА МНЕ",
    color: "#FFB84A",
    title: "Твой главный стопор — ты сам",
    subtitle: "Бизнес упёрся в твою пропускную способность.",
    familiar: [
      "Без тебя всё сразу проседает",
      "Ты — CRM, отдел продаж и пожарная в одном лице",
      "Команда ждёт указаний, а не решает",
      "Делегировал — получил обратно с доплатой",
      "Рост упёрся: больше клиентов = больше на тебе",
      "Бизнес не существует без тебя",
    ],
    tried: [
      ["Делегирование", "но передать хаос другому ≠ убрать хаос"],
      ["Найм", "но новый человек добавил вопросов, а не снял слой"],
      ["CRM и автоматизация", "но система не работает, если всё замкнуто на тебе"],
      ["«Отпустить контроль»", "но отпускать нечего, если системы нет"],
    ],
    scenes: [
      "Третий раз за квартал чиню одно и то же за менеджером. Плачу за делегирование — получаю обратно.",
      "Уехал на три дня — вернулся к завалу. Без меня никто не знает, что делать.",
      "Торможу продажи, потому что знаю: если придёт ещё пять клиентов — не вывезу.",
    ],
  },
  chaos: {
    tag: "ХАОС БЕЗ СИСТЕМЫ",
    color: "#A78BFA",
    title: "Твой главный стопор — хаос",
    subtitle: "Движение есть, а роста нет. Непонятно, что чинить первым.",
    familiar: [
      "Много делаешь, а результата мало",
      "Не можешь ответить, что именно не работает",
      "Пробовал кусками — ничего не склеивается",
      "Вроде всё на месте, но система не едет",
      "Ощущение: бегу на месте",
      "Не понимаешь, за что схватиться",
    ],
    tried: [
      ["Новые инструменты", "но инструмент поверх хаоса = ещё один слой"],
      ["Обучение", "но знания без точки приложения = шум"],
      ["Трекер или ментор", "но советы не работают без диагностики"],
      ["Планирование", "но план из хаоса = хаотичный план"],
    ],
    scenes: [
      "Сел в субботу составить план. Через два часа закрыл ноут. Не от лени. От непонимания, за что хвататься.",
      "Купил три курса за год. Знаний больше, результат тот же.",
      "Каждый понедельник «с нового листа». К среде — опять тот же цикл. Восьмой месяц.",
    ],
  },
};

const PRIORITY = ["burnout", "me", "money", "chaos"];

function getResult(scores) {
  let max = 0;
  let winner = "chaos";
  for (const p of PRIORITY) {
    if ((scores[p] || 0) > max) {
      max = scores[p] || 0;
      winner = p;
    }
  }
  return winner;
}

async function sendToTelegram(name, tg, result, scores, answers) {
  if (TG_BOT_TOKEN === "YOUR_BOT_TOKEN") return;
  const r = RESULTS[result];
  const text = `🔴 НОВАЯ ЗАЯВКА С КВИЗА\n\n` +
    `Имя: ${name}\n` +
    `Telegram: ${tg}\n\n` +
    `Стопор: ${r.tag}\n` +
    `Скоринг: перегрев=${scores.burnout} | деньги=${scores.money} | на мне=${scores.me} | хаос=${scores.chaos}\n\n` +
    `Ответы:\n${answers.map((a, i) => `${i + 1}. ${a.join(", ")}`).join("\n")}`;
  try {
    await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: "HTML" }),
    });
  } catch (e) { console.log("TG send error", e); }
}

// ========== COMPONENTS ==========

function StartScreen({ onStart }) {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "40px 24px",
      opacity: v ? 1 : 0, transform: v ? "none" : "translateY(20px)",
      transition: "all 0.6s ease"
    }}>
      <div style={{ marginBottom: 20 }}>
        <span style={{
          fontSize: 11, letterSpacing: 3, textTransform: "uppercase",
          color: "#FF6B4A", fontWeight: 600
        }}>ПУТЬ / диагностика</span>
      </div>

      <h1 style={{
        fontSize: 30, lineHeight: 1.15, fontWeight: 800,
        color: "#F5F5F0", marginBottom: 12
      }}>
        Найди, что <span style={{ color: "#FF6B4A" }}>на самом деле</span> тормозит твой рост
      </h1>

      <p style={{
        fontSize: 16, lineHeight: 1.55, color: "#999", marginBottom: 32
      }}>
        Не ещё одна теория. За 2 минуты — конкретный ответ: где у тебя главный стопор и с чего начать.
      </p>

      <div style={{
        background: "#141414", borderRadius: 14, padding: "18px 20px",
        border: "1px solid #1E1E1E", marginBottom: 32
      }}>
        {[
          "Где утекают клиенты, деньги и силы",
          "Что именно тормозит: поток, продажа, хаос или ты сам",
          "С чего начать, чтобы пошёл реальный сдвиг",
        ].map((t, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            padding: "8px 0",
            borderBottom: i < 2 ? "1px solid #1A1A1A" : "none"
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 6, marginTop: 1,
              background: "#FF6B4A18", display: "flex", flexShrink: 0,
              alignItems: "center", justifyContent: "center"
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF6B4A" }} />
            </div>
            <span style={{ fontSize: 14, color: "#C8C8C8", lineHeight: 1.5 }}>{t}</span>
          </div>
        ))}
      </div>

      <button onClick={onStart} style={{
        width: "100%", padding: "18px 0", borderRadius: 14,
        background: "#FF6B4A", color: "#fff", fontSize: 17,
        fontWeight: 700, border: "none", cursor: "pointer",
        letterSpacing: 0.3, position: "relative", overflow: "hidden"
      }}>
        Пройти диагностику
      </button>
      <p style={{
        fontSize: 12, color: "#555", textAlign: "center", marginTop: 12
      }}>
        6 вопросов · Можно выбрать несколько ответов
      </p>
    </div>
  );
}

function QuizScreen({ question, index, total, onAnswer, onBack }) {
  const [selected, setSelected] = useState([]);
  const [v, setV] = useState(false);

  useEffect(() => {
    setSelected([]);
    setV(false);
    setTimeout(() => setV(true), 50);
  }, [index]);

  const toggle = (i) => {
    setSelected(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const handleNext = () => {
    if (selected.length === 0) return;
    const chosen = selected.map(i => question.opts[i]);
    onAnswer(chosen);
  };

  const progress = (index / total) * 100;

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      padding: "20px 20px 32px",
      opacity: v ? 1 : 0, transform: v ? "none" : "translateX(30px)",
      transition: "all 0.35s ease"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        {index > 0 && (
          <button onClick={onBack} style={{
            background: "none", border: "none", color: "#666",
            fontSize: 14, cursor: "pointer", padding: "4px 0"
          }}>← назад</button>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "#555" }}>{index + 1} / {total}</span>
      </div>

      {/* Progress */}
      <div style={{
        height: 3, background: "#1A1A1A", borderRadius: 2,
        overflow: "hidden", marginBottom: 28
      }}>
        <div style={{
          height: "100%", background: "#FF6B4A", borderRadius: 2,
          width: `${progress}%`, transition: "width 0.4s ease"
        }} />
      </div>

      {/* Question */}
      <h2 style={{
        fontSize: 22, lineHeight: 1.3, fontWeight: 700,
        color: "#F5F5F0", marginBottom: 6
      }}>
        {question.q}
      </h2>
      <p style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>
        {question.qual ? "Выбери один вариант" : "Можно выбрать несколько"}
      </p>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {question.opts.map((opt, i) => {
          const active = selected.includes(i);
          return (
            <button key={i} onClick={() => {
              if (question.qual) {
                setSelected([i]);
                setTimeout(() => onAnswer([question.opts[i]]), 350);
              } else {
                toggle(i);
              }
            }} style={{
              width: "100%", textAlign: "left", padding: "14px 16px",
              borderRadius: 12, border: "1.5px solid",
              borderColor: active ? "#FF6B4A" : "#222",
              background: active ? "#FF6B4A10" : "#111",
              color: active ? "#FF6B4A" : "#C8C8C8",
              fontSize: 15, lineHeight: 1.45, cursor: "pointer",
              transition: "all 0.2s ease", display: "flex",
              alignItems: "center", gap: 12
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                border: `1.5px solid ${active ? "#FF6B4A" : "#333"}`,
                background: active ? "#FF6B4A" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s ease"
              }}>
                {active && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>
              {opt.text}
            </button>
          );
        })}
      </div>

      {/* Next button (for multi-select questions) */}
      {!question.qual && (
        <button onClick={handleNext} disabled={selected.length === 0} style={{
          width: "100%", padding: "16px 0", borderRadius: 14, marginTop: 20,
          background: selected.length === 0 ? "#222" : "#FF6B4A",
          color: selected.length === 0 ? "#555" : "#fff",
          fontSize: 16, fontWeight: 600, border: "none",
          cursor: selected.length === 0 ? "default" : "pointer",
          transition: "all 0.25s ease"
        }}>
          Далее
        </button>
      )}
    </div>
  );
}

function ContactScreen({ onSubmit }) {
  const [name, setName] = useState("");
  const [tg, setTg] = useState("");
  const [v, setV] = useState(false);

  useEffect(() => { setTimeout(() => setV(true), 100); }, []);

  const inputStyle = {
    width: "100%", padding: "15px 16px", borderRadius: 12,
    border: "1.5px solid #222", background: "#111",
    color: "#F5F5F0", fontSize: 16, outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s"
  };

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "40px 24px",
      opacity: v ? 1 : 0, transition: "opacity 0.5s ease"
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14, marginBottom: 20,
        background: "#FF6B4A18", display: "flex",
        alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ fontSize: 24, color: "#FF6B4A" }}>✓</span>
      </div>

      <h2 style={{
        fontSize: 24, fontWeight: 800, color: "#F5F5F0", marginBottom: 8
      }}>
        Готово. Я уже вижу твой главный стопор.
      </h2>
      <p style={{
        fontSize: 15, color: "#888", lineHeight: 1.6, marginBottom: 28
      }}>
        Оставь имя и Telegram — увидишь персональный результат: где стопор и с чего начать.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        <input
          placeholder="Имя"
          value={name}
          onChange={e => setName(e.target.value)}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = "#FF6B4A"}
          onBlur={e => e.target.style.borderColor = "#222"}
        />
        <input
          placeholder="@username в Telegram"
          value={tg}
          onChange={e => setTg(e.target.value)}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = "#FF6B4A"}
          onBlur={e => e.target.style.borderColor = "#222"}
        />
      </div>

      <button
        onClick={() => onSubmit(name, tg)}
        disabled={!name || !tg}
        style={{
          width: "100%", padding: "17px 0", borderRadius: 14,
          background: (!name || !tg) ? "#222" : "#FF6B4A",
          color: (!name || !tg) ? "#555" : "#fff",
          fontSize: 17, fontWeight: 700, border: "none",
          cursor: (!name || !tg) ? "default" : "pointer",
          transition: "all 0.3s ease"
        }}
      >
        Получить результат
      </button>

      <p style={{
        fontSize: 12, color: "#444", textAlign: "center",
        marginTop: 14, lineHeight: 1.5
      }}>
        Это не автоворонка. Я сам смотрю каждый ответ и пишу в Telegram.
      </p>
    </div>
  );
}

function CycleVisual({ color }) {
  const items = ["Перегрев", "Кривые решения", "Потеря денег", "Тревога и ручной режим"];
  return (
    <div style={{
      position: "relative", width: 240, height: 240,
      margin: "10px auto 16px"
    }}>
      {/* Circle path */}
      <svg width="240" height="240" viewBox="0 0 240 240" style={{ position: "absolute" }}>
        <circle cx="120" cy="120" r="90" fill="none" stroke="#1E1E1E" strokeWidth="1.5" />
        {/* Arrows on the circle */}
        {[0, 1, 2, 3].map(i => {
          const angle = (i * 90 - 45) * Math.PI / 180;
          const x = 120 + 90 * Math.cos(angle);
          const y = 120 + 90 * Math.sin(angle);
          const rot = i * 90 - 45;
          return (
            <g key={i} transform={`translate(${x},${y}) rotate(${rot + 90})`}>
              <path d="M-4,-3 L0,3 L4,-3" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            </g>
          );
        })}
      </svg>
      {/* Labels */}
      {items.map((item, i) => {
        const positions = [
          { top: 4, left: "50%", transform: "translateX(-50%)" },
          { top: "50%", right: -10, transform: "translateY(-50%)" },
          { bottom: 4, left: "50%", transform: "translateX(-50%)" },
          { top: "50%", left: -10, transform: "translateY(-50%)" },
        ];
        return (
          <div key={i} style={{
            position: "absolute", ...positions[i],
            background: "#0A0A0A", padding: "4px 10px", borderRadius: 8,
            border: `1px solid ${color}30`, maxWidth: 110, textAlign: "center"
          }}>
            <span style={{ fontSize: 11, color: "#C0C0C0", lineHeight: 1.3 }}>{item}</span>
          </div>
        );
      })}
      {/* Center text */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)", textAlign: "center"
      }}>
        <span style={{ fontSize: 20 }}>🔄</span>
      </div>
    </div>
  );
}

function ResultScreen({ result, userName }) {
  const r = RESULTS[result];
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);

  return (
    <div style={{
      minHeight: "100dvh", padding: "28px 20px 48px",
      opacity: v ? 1 : 0, transition: "opacity 0.6s ease"
    }}>
      {/* Tag */}
      <div style={{
        display: "inline-block", padding: "5px 14px", borderRadius: 8,
        background: `${r.color}15`, border: `1px solid ${r.color}25`,
        marginBottom: 16
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: r.color,
          letterSpacing: 2, textTransform: "uppercase"
        }}>{r.tag}</span>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 26, lineHeight: 1.2, fontWeight: 800,
        color: "#F5F5F0", marginBottom: 8
      }}>
        {userName ? `${userName}, ${r.title.charAt(0).toLowerCase() + r.title.slice(1)}` : r.title}
      </h1>
      <p style={{
        fontSize: 15, color: "#888", lineHeight: 1.5, marginBottom: 28
      }}>{r.subtitle}</p>

      {/* Знакомая картина */}
      <div style={{
        background: "#111", borderRadius: 14, padding: "20px 18px",
        border: "1px solid #1A1A1A", marginBottom: 16
      }}>
        <h3 style={{
          fontSize: 12, fontWeight: 700, color: "#555",
          textTransform: "uppercase", letterSpacing: 2, marginBottom: 14
        }}>Знакомая картина?</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {r.familiar.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: r.color, fontSize: 16, lineHeight: 1, marginTop: 2 }}>—</span>
              <span style={{ fontSize: 14, color: "#C0C0C0", lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Замкнутый круг */}
      <div style={{
        background: "#111", borderRadius: 14, padding: "20px 18px",
        border: "1px solid #1A1A1A", marginBottom: 16
      }}>
        <h3 style={{
          fontSize: 12, fontWeight: 700, color: "#555",
          textTransform: "uppercase", letterSpacing: 2, marginBottom: 8
        }}>Замкнутый круг</h3>
        <CycleVisual color={r.color} />
        <p style={{
          fontSize: 14, color: r.color, fontWeight: 500, textAlign: "center",
          fontStyle: "italic", lineHeight: 1.5
        }}>
          Пока ты внутри этого круга — ты всё время чинишь не то место.
        </p>
      </div>

      {/* Что пробовал */}
      <div style={{
        background: "#111", borderRadius: 14, padding: "20px 18px",
        border: "1px solid #1A1A1A", marginBottom: 16
      }}>
        <h3 style={{
          fontSize: 12, fontWeight: 700, color: "#555",
          textTransform: "uppercase", letterSpacing: 2, marginBottom: 14
        }}>Что ты уже пробовал</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {r.tried.map(([what, why], i) => (
            <div key={i} style={{ fontSize: 14, lineHeight: 1.5 }}>
              <span style={{ color: "#EF4444" }}>✕ </span>
              <span style={{ color: "#D0D0D0", fontWeight: 600 }}>{what}</span>
              <span style={{ color: "#777" }}> — {why}</span>
            </div>
          ))}
        </div>
        <p style={{
          fontSize: 13, color: "#777", marginTop: 14, fontStyle: "italic"
        }}>
          Проблема не в инструментах. Проблема — чинили куски, а не связку.
        </p>
      </div>

      {/* Метод */}
      <div style={{
        background: "#111", borderRadius: 14, padding: "20px 18px",
        border: "1px solid #1A1A1A", marginBottom: 16
      }}>
        <h3 style={{
          fontSize: 12, fontWeight: 700, color: "#555",
          textTransform: "uppercase", letterSpacing: 2, marginBottom: 14
        }}>Почему ломается всё сразу</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <p style={{ fontSize: 12, color: r.color, fontWeight: 700, marginBottom: 5 }}>ВНУТРЕННИЙ КОНТУР</p>
            <p style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>
              Состояние → Внимание → Паттерны → Действия → Среда
            </p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: r.color, fontWeight: 700, marginBottom: 5 }}>ВНЕШНИЙ КОНТУР</p>
            <p style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>
              Рынок · Клиент · Позиция · Оффер · Привлечение · Продажа · Метрики
            </p>
          </div>
        </div>
        <p style={{
          fontSize: 14, color: "#999", marginTop: 14, lineHeight: 1.6
        }}>
          Когда оба контура перегружены — они ломают друг друга. Именно поэтому отдельно психолог, маркетолог, трекер — не дают устойчивого результата.
        </p>
      </div>

      {/* Цена бездействия */}
      <div style={{
        background: "#111", borderRadius: 14, padding: "20px 18px",
        border: `1px solid ${r.color}20`, marginBottom: 16
      }}>
        <h3 style={{
          fontSize: 12, fontWeight: 700, color: "#555",
          textTransform: "uppercase", letterSpacing: 2, marginBottom: 16
        }}>Цена бездействия</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {r.scenes.map((scene, i) => (
            <div key={i} style={{
              paddingLeft: 14, borderLeft: `2px solid ${r.color}40`
            }}>
              <p style={{
                fontSize: 14, color: "#B0B0B0", lineHeight: 1.6, fontStyle: "italic"
              }}>{scene}</p>
            </div>
          ))}
        </div>
        <p style={{
          fontSize: 14, color: r.color, fontWeight: 600, marginTop: 18
        }}>
          Это не слабость. Это цена, которую ты платишь каждый месяц, пока главный узел не найден.
        </p>
      </div>

      {/* С чего начинают */}
      <div style={{
        background: "#111", borderRadius: 14, padding: "20px 18px",
        border: "1px solid #1A1A1A", marginBottom: 28
      }}>
        <h3 style={{
          fontSize: 12, fontWeight: 700, color: "#555",
          textTransform: "uppercase", letterSpacing: 2, marginBottom: 14
        }}>С чего начинают те, у кого потом сдвиг</h3>
        {[
          ["1", "Перестают чинить всё подряд", "Находят один главный узел"],
          ["2", "Чинят связку, а не куски", "Внутреннее и внешнее вместе"],
          ["3", "Начинают с первого узла", "Один ремонт, один сдвиг"],
        ].map(([n, title, sub]) => (
          <div key={n} style={{
            display: "flex", gap: 12, padding: "8px 0",
            borderBottom: n !== "3" ? "1px solid #1A1A1A" : "none"
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: `${r.color}12`, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 800, color: r.color, flexShrink: 0
            }}>{n}</div>
            <div>
              <p style={{ fontSize: 14, color: "#D0D0D0", fontWeight: 600 }}>{title}</p>
              <p style={{ fontSize: 13, color: "#777" }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        background: "#141414", borderRadius: 18, padding: "28px 22px",
        border: `1px solid ${r.color}20`, textAlign: "center"
      }}>
        <h3 style={{
          fontSize: 20, fontWeight: 800, color: "#F5F5F0", marginBottom: 8
        }}>Личный разбор</h3>
        <p style={{
          fontSize: 14, color: "#888", lineHeight: 1.6, marginBottom: 22
        }}>
          30–40 минут. Найдём главный узел, покажу что чинить первым. В конце скажу, есть ли смысл идти глубже.
        </p>

        <a href={TG_LINK} target="_blank" rel="noopener noreferrer" style={{
          display: "block", width: "100%", padding: "17px 0", borderRadius: 14,
          background: r.color, color: "#fff", fontSize: 17,
          fontWeight: 700, textDecoration: "none",
          boxShadow: `0 6px 28px ${r.color}35`
        }}>
          Написать Андрею →
        </a>

        <div style={{
          marginTop: 22, paddingTop: 18,
          borderTop: "1px solid #222"
        }}>
          <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7 }}>
            <span style={{ color: "#888", fontWeight: 600 }}>Андрей Совко.</span> Чемпион мира WPC. Бывший управляющий партнёр EdTech в топ-1% рынка, команда 150 чел. 100+ проектов в консалтинге.
          </p>
          <p style={{
            fontSize: 12, color: r.color, marginTop: 8, fontStyle: "italic"
          }}>
            Я сам смотрю каждую анкету. Это не автоворонка.
          </p>
        </div>
      </div>
    </div>
  );
}

// ========== MAIN ==========

export default function App() {
  const [screen, setScreen] = useState("start");
  const [qIndex, setQIndex] = useState(0);
  const [scores, setScores] = useState({ burnout: 0, money: 0, me: 0, chaos: 0 });
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [userName, setUserName] = useState("");

  const handleStart = () => setScreen("quiz");

  const handleAnswer = (chosen) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = chosen.map(o => o.text);

    if (!QUESTIONS[qIndex].qual) {
      const newScores = { ...scores };
      chosen.forEach(o => { newScores[o.s] = (newScores[o.s] || 0) + 1; });
      setScores(newScores);
    }

    setAnswers(newAnswers);

    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      setScreen("contact");
    }
  };

  const handleBack = () => {
    if (qIndex > 0) {
      // Откатываем скоринг предыдущего вопроса
      const prevQ = QUESTIONS[qIndex - 1];
      if (!prevQ.qual && answers[qIndex - 1]) {
        const newScores = { ...scores };
        const prevAnswerTexts = answers[qIndex - 1];
        prevQ.opts.forEach(o => {
          if (prevAnswerTexts.includes(o.text)) {
            newScores[o.s] = Math.max(0, (newScores[o.s] || 0) - 1);
          }
        });
        setScores(newScores);
      }
      setQIndex(qIndex - 1);
    }
  };

  const handleContact = (name, tg) => {
    setUserName(name);
    const r = getResult(scores);
    setResult(r);
    sendToTelegram(name, tg, r, scores, answers);
    setScreen("result");
  };

  return (
    <div style={{
      background: "#0A0A0A", color: "#F5F5F0", minHeight: "100dvh",
      fontFamily: "'SF Pro Display', -apple-system, 'Segoe UI', sans-serif",
      maxWidth: 480, margin: "0 auto",
      WebkitFontSmoothing: "antialiased"
    }}>
      {screen === "start" && <StartScreen onStart={handleStart} />}
      {screen === "quiz" && (
        <QuizScreen
          question={QUESTIONS[qIndex]}
          index={qIndex}
          total={QUESTIONS.length}
          onAnswer={handleAnswer}
          onBack={handleBack}
        />
      )}
      {screen === "contact" && <ContactScreen onSubmit={handleContact} />}
      {screen === "result" && <ResultScreen result={result} userName={userName} />}
    </div>
  );
}
