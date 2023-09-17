import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import EventSource from 'react-native-event-source';

export default function App() {
  const es = React.useRef<EventSource | null>(null);

  const [result, setResult] = React.useState<string>('');

  React.useEffect(() => {
    es.current = new EventSource(
      'https://cd8f-175-113-78-217.ngrok.io/stream',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer hello`,
        },
        body: {
          message: '안녕',
        },
        debug: true,
        timeout: 5 * 1000,
      },
      {}
    );

    es.current.addEventListener('open', (e) => {
      console.log(e);
    });

    es.current.addEventListener('message', (e) => {
      const data = JSON.parse(e.data);

      if ('chunk' in data && data.chunk) {
        setResult((p) => p + data.chunk);
      }

      if ('end' in data) {
        es.current?.disconnect();
      }
    });

    es.current.addEventListener('error', (e) => {
      console.log(e);
      es.current?.disconnect();
    });

    return () => {
      es.current?.removeAllEventListeners();
      es.current?.disconnect();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
