import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import { isOpenAiConfigured, runAiChat } from "@/lib/ai/agent";
import { aiChatSchema } from "@/lib/validations/travel";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestId = createRequestId();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("invalid_json", "JSON non valido.", 400, requestId);
  }

  const parsed = aiChatSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validation_error", "Messaggio non valido.", 400, requestId);
  }

  if (!isOpenAiConfigured()) {
    return apiSuccess(
      {
        status: "openai_not_configured",
        message:
          "INTEGRAZIONE NON CONFIGURATA — API KEY NECESSARIA. Imposta OPENAI_API_KEY. Il form di ricerca manuale resta utilizzabile.",
        reply: null,
      },
      200,
      requestId,
    );
  }

  const history = (parsed.data.history ?? []).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const result = await runAiChat([
    ...history,
    { role: "user", content: parsed.data.message },
  ]);

  if (!result.ok) {
    return apiSuccess(
      {
        status: result.code,
        message: result.message,
        reply: null,
      },
      200,
      requestId,
    );
  }

  return apiSuccess(
    {
      status: "ok",
      reply: result.reply,
      toolResults: result.toolResults ?? [],
    },
    200,
    requestId,
  );
}
