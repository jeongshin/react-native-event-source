import EventSourceIOS from './EventSource/EventSource.ios';
import EventSourceAndroid from './EventSource/EventSource.android';
import { Platform } from 'react-native';

export default Platform.OS === 'android' ? EventSourceAndroid : EventSourceIOS;
