import { EventEmitter } from "events";

// Global event emitter for SSE pub/sub
// In production with multiple Cloud Run instances, replace with Pub/Sub
const globalForEvents = globalThis as unknown as {
  orderEmitter: EventEmitter | undefined;
};

export const orderEmitter =
  globalForEvents.orderEmitter ?? new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalForEvents.orderEmitter = orderEmitter;
}

orderEmitter.setMaxListeners(50);

export type OrderEvent = {
  type: "new_order" | "status_change";
  orderId: string;
  eventId: string;
  status?: string;
};

export function emitOrderEvent(event: OrderEvent) {
  orderEmitter.emit("order", event);
}
