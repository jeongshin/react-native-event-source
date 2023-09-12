export type EventSourceEventType =
  | 'open'
  | 'close'
  | 'error'
  | 'message'
  | 'timeout'
  | 'suspend';

export type EventCallback = (data: EventSourceEvent) => void;

export type EventSourceEvent =
  | MessageEvent
  | TimeoutEvent
  | ErrorEvent
  | CloseEvent
  | OpenEvent
  | SuspendEvent;

/**
 * event that emitted when message event received
 * <T> should be typeof deserialized event data
 */
export interface MessageEvent extends EventBase {
  type: 'message';
  data: string;
}

/**
 * event that emitted when timeout occurred before first message event
 */
export interface TimeoutEvent extends EventBase {
  type: 'timeout';
}

/**
 * event that emitted when first message event received
 */
export interface OpenEvent extends EventBase {
  type: 'open';
}

/**
 * event that emitted when connection closed
 */
export interface CloseEvent extends EventBase {
  type: 'close';
}

/**
 * event that emitted when error occurred
 */
export interface ErrorEvent extends EventBase {
  type: 'error';
  error: string;
}

/**
 * event that emitted when no message event for a while
 * @see {@link EventSourceOptions.suspend}
 */
export interface SuspendEvent extends EventBase {
  type: 'suspend';
}

export interface EventBase {
  type: string;
}

export type HttpMethod = 'GET' | 'POST';

export type EventSourceHttpOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  debug?: boolean;
};

export type EventSourceStreamOptions = {
  speed?: number;
  suspendThresholds?: number;
  shouldMergeSameEvent?: boolean;
};
