# react-native-event-source

Server sent events handling for react native apps using native libraries

Android - [okhttp sse](https://github.com/square/okhttp)

iOS - [swift eventsource](https://github.com/launchdarkly/swift-eventsource)

## WIP 🏗️

- [ ] Testing
- [ ] Android
- [ ] iOS

## Installation

```sh
// using yarn
yarn add react-native-event-source

// using npm
npm install react-native-event-source
```

### Android

add below on `android/app/build.gradle`

```gradle
dependencies {
    // ...etc
    implementation 'com.squareup.okhttp3:okhttp:4.11.0'
    implementation 'com.squareup.okhttp3:okhttp-sse:4.11.0'
}
```

## Usage

```js

```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
