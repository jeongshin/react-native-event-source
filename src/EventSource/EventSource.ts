import type { EmitterSubscription, NativeModule } from 'react-native';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import type { EventSourceEventType } from '../types';

interface EventSourceNativeModule extends NativeModule {
  initialize(url: string, headers: Record<string, string>): void;
}

class EventSource<T extends EventSourceNativeModule> {
  protected nativeEventSource = requireNativeModule<T>();

  protected eventEmitter = new NativeEventEmitter(this.nativeEventSource);

  constructor() {
    this.nativeEventSource.initialize('', {});
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
