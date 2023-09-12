import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import EventSource from 'react-native-event-source';

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();

  React.useEffect(() => {
    const es = new EventSource(
      'https://3722-2a09-bac5-4734-155-00-22-82.ngrok.io/stream',
      {
        //
      }
    );

    es.addEventListener('open', (e) => {
      console.log(e);
    });

    es.addEventListener('message', (e) => {
      console.log(e);
    });
    // multiply(3, 7).then(setResult);
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
