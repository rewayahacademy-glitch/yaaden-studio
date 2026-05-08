import { getModel } from '@/services/llm';
import { buildAtomizerPrompt, type AtomizerResult } from '@/agents/atomizerAgent';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { braindump, masterAnalysis } = await req.json();

  if (!braindump?.trim()) {
    return Response.json({ error: 'Braindump requis' }, { status: 400 });
  }

  const model = getModel('flash');
  const prompt = buildAtomizerPrompt(braindump, masterAnalysis ?? '');

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // Strip markdown code fences if the model wraps its output
    const json = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    const parsed: AtomizerResult = JSON.parse(json);

    if (!Array.isArray(parsed.atoms)) {
      throw new Error('atoms manquant dans la réponse');
    }

    return Response.json(parsed);
  } catch (err) {
    return Response.json(
      { error: 'Erreur de parsing', details: String(err) },
      { status: 500 }
    );
  }
}
