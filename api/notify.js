export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

    if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
      return res.status(500).json({ ok: false, error: 'missing_env' });
    }

    const body = req.body || {};
    const { type, stopor, scores = {}, qualification = '', tg_user = {} } = body;

    if (type !== 'qualified_ping') {
      return res.status(400).json({ ok: false, error: 'wrong_type' });
    }

    const labelMap = {
      burnout: 'ПЕРЕГРЕВ',
      money: 'НЕТ КЛИЕНТОВ И ДЕНЕГ',
      me: 'ВСЁ НА МНЕ',
      chaos: 'ХАОС БЕЗ СИСТЕМЫ',
    };

    const text = [
      '🔥 КВИЗ-ЛИД ДОШЁЛ ДО КВАЛИФИКАЦИИ',
      '',
      `Имя: ${[tg_user.first_name || '', tg_user.last_name || ''].join(' ').trim() || '—'}`,
      `Username: ${tg_user.username ? '@' + tg_user.username : 'нет'}`,
      `Telegram ID: ${tg_user.id || 'нет'}`,
      `Стопор: ${labelMap[stopor] || stopor}`,
      `Квалификация: ${qualification || '—'}`,
      '',
      `Скоринг: перегрев=${scores.burnout || 0} | деньги=${scores.money || 0} | всё на мне=${scores.me || 0} | хаос=${scores.chaos || 0}`,
    ].join('\n');

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text,
      }),
    });

    const json = await tgRes.json();

    if (!json.ok) {
      return res.status(500).json({ ok: false, error: 'telegram_send_failed', details: json });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'unknown_error' });
  }
}
