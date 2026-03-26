import { useState, useEffect } from "react";

const TG_LINK = "https://t.me/sovkoandrei";

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

const RESULTS = {
  burnout: {
    tag: "ПЕРЕГРЕВ",
    color: "#FF6B4A",
    title: "Твой главный стопор — перегрев",
    subtitle: "Ты работаешь на остатках, и это уже стоит денег.",
  },
  money: {
    tag: "НЕТ КЛИЕНТОВ И ДЕНЕГ",
    color: "#4AAFFF",
    title: "Твой главный стопор — дыра в потоке",
    subtitle: "Клиенты и деньги приходят случайно, а не системно.",
  },
  me: {
    tag: "ВСЁ НА МНЕ",
    color: "#FFB84A",
    title: "Твой главный стопор — ты сам",
    subtitle: "Бизнес упёрся в твою пропускную способность.",
  },
  chaos: {
    tag: "ХАОС БЕЗ СИСТЕМЫ",
    color: "#A78BFA",
    title: "Твой главный стопор — хаос",
    subtitle: "Движение есть, а роста нет. Непонятно, что чинить первым.",
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

function getTelegramUser() {
  const tg = window.Telegram?.WebApp;
  return tg?.initDataUnsafe?.user || null;
}

function buildPayload(scores, answers, qualification) {
  const stopor = getResult(scores);
  const user = getTelegramUser();
  return {
    stopor,
    scores,
    answers,
    qualification,
    tg_user: user
      ? {
          id: user.id,
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          username: user.username || "",
        }
      : null,
  };
}

async function sendQualifiedPing(payload) {
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'qualified_ping', ...payload }),
    });
  } catch (e) {
    console.log('qualified ping error', e);
  }
}

function sendResultToBot(payload) {
  const tg = window.Telegram?.WebApp;
  if (tg?.sendData) {
    tg.sendData(JSON.stringify({ type: 'quiz_result', ...payload }));
    return true;
  }
  return false;
}

function StartScreen({ onStart }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#FF6B4A', fontWeight: 600 }}>ПУТЬ / диагностика</span>
      </div>
      <h1 style={{ fontSize: 30, lineHeight: 1.15, fontWeight: 800, color: '#F5F5F0', marginBottom: 12 }}>
        Найди, что <span style={{ color: '#FF6B4A' }}>на самом деле</span> тормозит твой рост
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.55, color: '#999', marginBottom: 32 }}>
        За 2 минуты — конкретный ответ: где у тебя главный стопор и с чего начать.
      </p>
      <button onClick={onStart} style={{ width: '100%', padding: '18px 0', borderRadius: 14, background: '#FF6B4A', color: '#fff', fontSize: 17, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
        Пройти диагностику
      </button>
      <p style={{ fontSize: 12, color: '#555', textAlign: 'center', marginTop: 12 }}>
        7 вопросов · можно выбрать несколько ответов
      </p>
    </div>
  );
}

function QuizScreen({ question, index, total, onAnswer, onBack }) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected([]);
  }, [index]);

  const toggle = (i) => {
    setSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };

  const handleNext = () => {
    if (selected.length === 0) return;
    const chosen = selected.map((i) => question.opts[i]);
    onAnswer(chosen);
  };

  const progress = ((index + 1) / total) * 100;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '20px 20px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        {index > 0 && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#666', fontSize: 14, cursor: 'pointer', padding: '4px 0' }}>← назад</button>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#555' }}>{index + 1} / {total}</span>
      </div>
      <div style={{ height: 3, background: '#1A1A1A', borderRadius: 2, overflow: 'hidden', marginBottom: 28 }}>
        <div style={{ height: '100%', background: '#FF6B4A', borderRadius: 2, width: `${progress}%`, transition: 'width 0.4s ease' }} />
      </div>
      <h2 style={{ fontSize: 22, lineHeight: 1.3, fontWeight: 700, color: '#F5F5F0', marginBottom: 6 }}>{question.q}</h2>
      <p style={{ fontSize: 13, color: '#555', marginBottom: 24 }}>{question.qual ? 'Выбери один вариант' : 'Можно выбрать несколько'}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {question.opts.map((opt, i) => {
          const active = selected.includes(i);
          return (
            <button
              key={i}
              onClick={() => {
                if (question.qual) {
                  setSelected([i]);
                  setTimeout(() => onAnswer([question.opts[i]]), 250);
                } else {
                  toggle(i);
                }
              }}
              style={{ width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: 12, border: '1.5px solid', borderColor: active ? '#FF6B4A' : '#222', background: active ? '#FF6B4A10' : '#111', color: active ? '#FF6B4A' : '#C8C8C8', fontSize: 15, lineHeight: 1.45, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `1.5px solid ${active ? '#FF6B4A' : '#333'}`, background: active ? '#FF6B4A' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}>
                {active && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>
              {opt.text}
            </button>
          );
        })}
      </div>
      {!question.qual && (
        <button onClick={handleNext} disabled={selected.length === 0} style={{ width: '100%', padding: '16px 0', borderRadius: 14, marginTop: 20, background: selected.length === 0 ? '#222' : '#FF6B4A', color: selected.length === 0 ? '#555' : '#fff', fontSize: 16, fontWeight: 600, border: 'none', cursor: selected.length === 0 ? 'default' : 'pointer' }}>
          Далее
        </button>
      )}
    </div>
  );
}

function ResultScreen({ payload, onOpenTelegram }) {
  const r = RESULTS[payload.stopor] || RESULTS.chaos;
  const firstName = payload.tg_user?.first_name || '';

  return (
    <div style={{ minHeight: '100dvh', padding: '24px 20px 36px' }}>
      <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 8, background: `${r.color}15`, border: `1px solid ${r.color}25`, marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: r.color, letterSpacing: 2, textTransform: 'uppercase' }}>{r.tag}</span>
      </div>
      <h1 style={{ fontSize: 26, lineHeight: 1.2, fontWeight: 800, color: '#F5F5F0', marginBottom: 8 }}>
        {firstName ? `${firstName}, ${r.title.charAt(0).toLowerCase() + r.title.slice(1)}` : r.title}
      </h1>
      <p style={{ fontSize: 15, color: '#888', lineHeight: 1.5, marginBottom: 18 }}>{r.subtitle}</p>

      <div style={{ background: '#111', borderRadius: 14, padding: '18px', border: '1px solid #1A1A1A', marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: '#D0D0D0', lineHeight: 1.6, marginBottom: 10 }}>
          Полный результат уже готов. Сейчас отправлю его тебе в Telegram и там же покажу следующий шаг.
        </p>
        <p style={{ fontSize: 13, color: '#777', lineHeight: 1.6 }}>
          После нажатия бот пришлёт результат текстом, кнопку разбора и запустит продолжение маршрута.
        </p>
      </div>

      <button onClick={onOpenTelegram} style={{ width: '100%', padding: '17px 0', borderRadius: 14, background: r.color, color: '#fff', fontSize: 17, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
        Открыть результат в Telegram
      </button>

      <a href={TG_LINK} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', padding: '16px 0', borderRadius: 14, background: 'transparent', color: '#999', fontSize: 15, fontWeight: 600, textDecoration: 'none', textAlign: 'center', marginTop: 10, border: '1px solid #222' }}>
        Если кнопка не сработала — открыть Андрея
      </a>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState('start');
  const [qIndex, setQIndex] = useState(0);
  const [scores, setScores] = useState({ burnout: 0, money: 0, me: 0, chaos: 0 });
  const [answers, setAnswers] = useState([]);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const handleStart = () => setScreen('quiz');

  const handleAnswer = async (chosen) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = chosen.map((o) => o.text);

    let nextScores = { ...scores };
    if (!QUESTIONS[qIndex].qual) {
      chosen.forEach((o) => {
        nextScores[o.s] = (nextScores[o.s] || 0) + 1;
      });
      setScores(nextScores);
    }

    setAnswers(newAnswers);

    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(qIndex + 1);
      return;
    }

    const qualification = chosen[0]?.text || '';
    const finalPayload = buildPayload(nextScores, newAnswers, qualification);
    setPayload(finalPayload);
    await sendQualifiedPing(finalPayload);
    setScreen('result');
  };

  const handleBack = () => {
    if (qIndex > 0) {
      const prevQ = QUESTIONS[qIndex - 1];
      if (!prevQ.qual && answers[qIndex - 1]) {
        const newScores = { ...scores };
        const prevAnswerTexts = answers[qIndex - 1];
        prevQ.opts.forEach((o) => {
          if (prevAnswerTexts.includes(o.text)) {
            newScores[o.s] = Math.max(0, (newScores[o.s] || 0) - 1);
          }
        });
        setScores(newScores);
      }
      setQIndex(qIndex - 1);
    }
  };

  const handleOpenTelegram = () => {
    if (!payload) return;
    const sent = sendResultToBot(payload);
    if (!sent) {
      window.open(TG_LINK, '_blank');
    }
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Inter, Segoe UI, Roboto, sans-serif', background: '#0A0A0A', minHeight: '100dvh' }}>
      {screen === 'start' && <StartScreen onStart={handleStart} />}
      {screen === 'quiz' && (
        <QuizScreen
          question={QUESTIONS[qIndex]}
          index={qIndex}
          total={QUESTIONS.length}
          onAnswer={handleAnswer}
          onBack={handleBack}
        />
      )}
      {screen === 'result' && payload && <ResultScreen payload={payload} onOpenTelegram={handleOpenTelegram} />}
    </div>
  );
}
