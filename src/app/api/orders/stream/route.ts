import { orderEmitter, type OrderEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const handler = (event: OrderEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      orderEmitter.on("order", handler);

      // Send heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      }, 30000);

      // Clean up on close
      const cleanup = () => {
        orderEmitter.off("order", handler);
        clearInterval(heartbeat);
      };

      // Handle abort
      controller.enqueue(encoder.encode(": connected\n\n"));

      // Store cleanup for when stream is cancelled
      (controller as unknown as { _cleanup: () => void })._cleanup = cleanup;
    },
    cancel(controller) {
      const cleanup = (controller as unknown as { _cleanup: () => void })
        ._cleanup;
      if (cleanup) cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
