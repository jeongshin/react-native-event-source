import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import EventSource from 'react-native-event-source';

export default function App() {
  const es = React.useRef<EventSource | null>(null);

  const [result, setResult] = React.useState<string>('');

  React.useEffect(() => {
    es.current = new EventSource(
      'https://4f9b-175-113-78-217.ngrok.io/stream/timeout',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer hello`,
        },
        body: JSON.stringify({
          message: '안녕',
        }),
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
      console.log(data, new Date().getTime());
      if ('chunk' in data) {
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
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
