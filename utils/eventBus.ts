import type { GameEvents, EventHandler } from "../types/eventTypes";

// todo: add conversion files like convertCardsForFrontEnd to future event middleware
// (although it's not like I'm even using middleware at the moment)

export class EventBus<E extends Record<string, any>> {
  private events: {
    [K in keyof E]?: EventHandler<E[K]>[];
  } = {};

  private _activeListeners?: Record<
    string,
    {
      handlers: Partial<{ [K in keyof E]: EventHandler<E[K]> }>;
      cleanup: (() => void) | null;
    }
  >;

  on<K extends keyof E>(event: K, callback: EventHandler<E[K]>): void {
    if (!this.events[event]) this.events[event] = [];
    this.events[event]!.push(callback);
  }

  off<K extends keyof E>(event: K, callback: EventHandler<E[K]>): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event]!.filter(cb => cb !== callback);
  }

  emit<K extends keyof E>(event: K, data: E[K]): void {
    if (!this.events[event]) return;

    console.log(
      `🎯 EVENTBUS: Emitting ${String(event)} to ${this.events[event]!.length} listeners`
    );

    this.events[event]!.forEach(cb => cb(data));
  }

  // todo: fix parameters for this function to be more intuative 
  async executeAndWait<K extends keyof E>(
    action: () => any,
    eventName: K,
    options?: {
      condition?: (data: E[K]) => boolean;
      timeout?: number;
      onTimeout?: () => void;
      onError?: (error: unknown) => void;
    }
  ): Promise<{ actionResult: any; payload: E[K] }> {
    const {
      condition = () => true,
      timeout = 10000,
      onTimeout,
      onError,
    } = options ?? {};

    const eventPromise = new Promise<E[K]>((resolve, reject) => {
      /*
      const timeoutId = setTimeout(() => {
        this.off(eventName, handler);
        onTimeout?.();
        reject(new Error(`Timeout waiting for event: ${String(eventName)}`));
      }, timeout);
      */
     // todo: introduce proper timeout logic

      const handler: EventHandler<E[K]> = (data) => {
        try {
          if (condition(data)) {
            //clearTimeout(timeoutId);
            this.off(eventName, handler);
            resolve(data);
          }
        } catch (err) {
          //clearTimeout(timeoutId);
          this.off(eventName, handler);
          onError?.(err);
          reject(err);
        }
      };

      this.on(eventName, handler);
    });

    const actionResult = action();
    const payload = await eventPromise;

    return { actionResult, payload };
  }

  setUpEventListeners(
    handlers: Partial<{ [K in keyof E]: EventHandler<E[K]> }>,
    listenerId = "default"
  ): () => void {
    if (this._activeListeners?.[listenerId]) {
      console.log(`⚠️ Listeners already active for: ${listenerId}`);
      return () => {};
    }

    if (!this._activeListeners) this._activeListeners = {};

    Object.entries(handlers).forEach(([event, handler]) => {
      this.on(event as keyof E, handler as any);
    });

    const cleanup = () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        this.off(event as keyof E, handler as any);
      });
      delete this._activeListeners![listenerId];
    };

    this._activeListeners[listenerId] = { handlers, cleanup };

    console.log(
      `🎯 Event listeners set up for ${listenerId}:`,
      Object.keys(handlers).join(", ")
    );

    return cleanup;
  }

  cleanupAllListeners(): void {
    if (!this._activeListeners) return;

    Object.values(this._activeListeners).forEach(entry => {
      entry.cleanup?.();
    });

    this._activeListeners = {};
  }

  getListenerCount<K extends keyof E>(event: K): number {
    return this.events[event]?.length ?? 0;
  }

  getAllEvents(): (keyof E)[] {
    return Object.keys(this.events) as (keyof E)[];
  }
}

export const eventBus = new EventBus<GameEvents>();