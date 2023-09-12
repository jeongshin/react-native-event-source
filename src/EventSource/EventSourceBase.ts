import type { EmitterSubscription, NativeModule } from 'react-native';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import type {
  EventCallback,
  EventSourceEventType,
  EventSourceHttpOptions,
  EventSourceStreamOptions,
} from '../types';

interface EventSourceNativeModule extends NativeModule {
  initialize(url: string, options: EventSourceHttpOptions): void;
}

class EventSource<T extends EventSourceNativeModule = EventSourceNativeModule> {
  protected nativeEventSource = requireNativeModule<T>();

  protected eventEmitter = new NativeEventEmitter();

  private url: string;

  private debug: boolean;

  private listeners: Record<EventSourceEventType, EventCallback[]> = {
    open: [],
    message: [],
    close: [],
    error: [],
    suspend: [],
  };

  constructor(
    url: string,
    {
      headers = {},
      body = '',
      method = 'GET',
      timeout = 30 * 1000,
    }: EventSourceHttpOptions,
    { debug }: EventSourceStreamOptions = {}
  ) {
    const nativeEvents: EventSourceEventType[] = [
      'open',
      'message',
      'error',
      'close',
    ];

    this.url = url;

    this.debug = debug ?? false;

    this.nativeEventSource.initialize(url, { headers, body, method, timeout });

    nativeEvents.forEach((nativeEvent) => {
      this.eventEmitter.addListener(nativeEvent, (event) => {
        this.log('received event from native', event);
        this.listeners[nativeEvent].forEach((listener) => {
          listener({ type: nativeEvent, data: event.data, url: this.url });
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
