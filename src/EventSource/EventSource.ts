import type { EmitterSubscription, NativeModule } from 'react-native';

import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

import type {
  EventCallback,
  EventSourceEventType,
  EventSourceHttpOptions,
  EventSourceStreamOptions,
} from '../types';

interface EventSourceNativeModule extends NativeModule {
  connect(url: string, options: EventSourceHttpOptions): void;
  disconnect(): void;
}

class EventSource<T extends EventSourceNativeModule = EventSourceNativeModule> {
  protected nativeEventSource = requireNativeModule<T>();

  protected eventEmitter = new NativeEventEmitter(
    Platform.OS === 'ios' ? this.nativeEventSource : undefined
  );

  private url: string;

  private debug: boolean;

  private listeners: Record<EventSourceEventType, EventCallback[]> = {
    open: [],
    message: [],
    close: [],
    error: [],
    suspend: [],
    timeout: [],
  };

  constructor(
    url: string,
    {
      headers = {},
      body = '',
      method = 'GET',
      timeout = 30 * 1000,
      debug = false,
    }: EventSourceHttpOptions,
    {}: EventSourceStreamOptions = {}
  ) {
    const nativeEvents: EventSourceEventType[] = [
      'open',
      'message',
      'error',
      'close',
    ];

    this.url = url;
    this.debug = debug;

    this.nativeEventSource.connect(url, {
      headers,
      body,
      method,
      timeout,
      debug,
    });

    nativeEvents.forEach((nativeEvent) => {
      this.eventEmitter.addListener(nativeEvent, (event) => {
        this.listeners[nativeEvent].forEach((listener) => {
          listener(event);
        });
      });
    });
  }

  protected log(...args: any) {
    if (this.debug) {
      console.log(`[EventSource]`, ...args);
    }
  }

  public addEventListener<E extends EventSourceEventType>(
    event: E,
    listener: (...args: any[]) => void
  ): EmitterSubscription {
    return this.eventEmitter.addListener(event, listener);
  }

  public removeEventListeners<E extends EventSourceEventType>(event: E): void {
    this.eventEmitter.removeAllListeners(event);
  }

  public disconnect(): void {
    this.nativeEventSource.disconnect();
  }
}

const LINKING_ERROR =
  `The package 'react-native-event-source' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

function requireNativeModule<T>(): T {
  return NativeModules.EventSource
    ? NativeModules.EventSource
    : new Proxy(
        {},
        {
          get() {
            throw new Error(LINKING_ERROR);
          },
        }
      );
}

export default EventSource;
