import { getModel } from '@/services/llm';
import { buildMasterPrompt } from '@/agents/masterAgent';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { braindump } = await req.json();

  if (!braindump?.trim()) {
    return new Response('Braindump requis', { status: 400 });
  }

  const model = getModel('flash');
  const prompt = buildMasterPrompt(braindump);

  const result = await model.generateContentStream(prompt);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: 'Erreur de streaming' })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
