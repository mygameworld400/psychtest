// AI 분석 함수 — 사용자의 선택 + 자유서술 답변을 OpenAI에 보내
// 장문의 개인화된 행동 패턴 분석을 받아 돌려준다.
// 브라우저에서 anon key로 직접 호출한다 (로그인 없는 공개 사이트).

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `너는 재미있는 심리테스트 결과를 써주는 작가야. 사용자가 상황형 질문에 고른 선택지와,
그걸 고른 이유로 직접 적은 자유서술 답변을 보고, 그 사람의 실제 행동 패턴을 분석해줘.

규칙:
- 무엇을 선택했는지보다 "왜 그렇게 선택했는지"에서 근거를 찾아라. 사용자가 쓴 표현을 자연스럽게 인용하거나 요약해서 반영해라.
- 하나의 고정된 유형명으로 단정하지 마라 ("당신은 회피형입니다" 같은 표현 금지).
- "당신은 무조건 이런 사람이다" 대신 "이번 답변에서는 이런 경향이 보여" 처럼 이번 답변 기준의 경향으로 설명해라.
- 심리학적/의료적 진단처럼 말하지 마라 (나르시시스트, 애착유형, 정신질환 명칭 등 금지).
- 친근하고 재미있는 반말 톤으로 쓰되("ㅋㅋ", "~야", "~편이야" 등), 무례하거나 비꼬지는 마라.
- 선택권, 위험 감수, 애착 대상, 손실 허용 범위, 미래지향성, 의사결정 방식 등 여러 축을 종합해서 분석해라.
- 마지막은 굵은 한 줄 요약으로 끝내라.
- 전체 400~600자 분량의 한국어 문단으로 작성해라. 마크다운 헤더는 쓰지 말고 자연스러운 문단과 줄바꿈만 써라.`;

function buildUserPrompt(testTitle: string, items: { question: string; choiceText: string; reason?: string }[]) {
  const lines = items.map((it, i) => {
    const parts = [`${i + 1}. 질문: ${it.question}`, `   선택: ${it.choiceText}`];
    if (it.reason && it.reason.trim()) parts.push(`   이유: ${it.reason.trim()}`);
    return parts.join("\n");
  });
  return `테스트: ${testTitle}\n\n${lines.join("\n\n")}\n\n위 답변을 바탕으로 이 사람의 행동 패턴을 분석해줘.`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST만 지원합니다" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const { testTitle, items } = await req.json();
    if (!testTitle || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "testTitle, items가 필요합니다" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY가 설정되지 않았습니다" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.9,
        max_tokens: 900,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(testTitle, items) },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      return new Response(JSON.stringify({ error: "OpenAI 호출 실패", detail: errText }), {
        status: 502,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const data = await openaiRes.json();
    const analysis = data.choices?.[0]?.message?.content?.trim() ?? "";

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
