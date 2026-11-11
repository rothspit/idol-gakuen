/**
 * SEO本文用 LLM（アイドル学園）
 */

const SYSTEM = `あなたは日本語の店舗公式サイト向けSEO編集者です。予約につながる情報を丁寧に書き、誇大表現・違法誘引は書きません。在籍は18歳以上かつ高校非在籍のみ。JK・制服はコスプレコンセプトであり実在の高校生ではないことを必要に応じて明示します。`;

export function buildArticlePrompt({ title, query, outline, cta, castAgePolicy }) {
  return `あなたは船橋デリヘル「アイドル学園」（idolgakuen.jp）の日本語SEOライターです。
読者は船橋・西船橋・津田沼周辺でデリヘルを検討しているお客様。安心感・エリア・料金の見方・予約の流れを重視。
在籍ポリシー: ${castAgePolicy || '18歳以上（高校生在籍不可）'}。
禁止: 実在の未成年・高校生を想起させる採用・在籍表現、根拠のない最安・絶対の断定、他店の誹謗。
「JK」「制服」はコスプレ／コンセプトとして書き、実在高校生ではないことを混同させない。
料金は断定せず目安または店舗確認と書く。
検索クエリ「${query}」向けの記事本文を Markdown で書いてください。
タイトル: ${title}
構成ヒント:
${outline.map((h, i) => `${i + 1}. ${h}`).join('\n')}
要件:
- H2/H3 を使う
- 内部リンクを自然に入れる（/funabashi /funabashi/reserve /funabashi/guide /schedule）
- 電話: ${cta.phone || '050-1745-9665'}
- 2000〜4000字程度
- 先頭に # タイトル行は不要
- 明るく親しみやすいトーン`;
}

export async function generateArticleBody({ title, query, outline, cta, castAgePolicy }) {
  const prompt = buildArticlePrompt({ title, query, outline, cta, castAgePolicy });
  if (process.env.ANTHROPIC_API_KEY) {
    const text = await callClaude(prompt);
    if (text) return { text, provider: 'anthropic' };
  }
  if (process.env.OPENAI_API_KEY) {
    const text = await callOpenAI(prompt);
    if (text) return { text, provider: 'openai' };
  }
  return null;
}

async function callClaude(prompt) {
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      temperature: 0.55,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return (data.content || []).filter((p) => p.type === 'text').map((p) => p.text).join('\n').trim() || null;
}

async function callOpenAI(prompt) {
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.55,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}
