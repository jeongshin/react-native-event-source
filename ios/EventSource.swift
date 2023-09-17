import React
import LDSwiftEventSource

enum EventType: String {
    case OPEN = "open"
    case CLOSE = "close"
    case MESSAGE = "message"
    case ERROR = "error"
    case TIMEOUT = "timeout"
}

@objc(EventSource)
class EventSource: RCTEventEmitter {
    override static func moduleName() -> String {
        return "EventSource"
    }
    
    private var _connceted: Bool = false;
    private var _eventsource: LDSwiftEventSource.EventSource?;
    
    /**
     make connection to server
     - Parameter url - endpoint to connect sse
     - Parameter options.header header values as Dictionary
     - Parameter options.method "GET" or "POST"
     - Parameter options.body
     - Parameter options.lastEventId last emitted event id
     */
    @objc(connect:options:)
    func connect(url: String, options: NSObject) -> Void {
        if (self._connceted) {
            return;
        }
        
        self._connceted = true;
        
        let config = self.setUpConfig(url: url, options: options)

        self._eventsource = LDSwiftEventSource.EventSource(config: config)
        self._eventsource?.start()
        
        let semaphore = DispatchSemaphore(value: 0)
        let runLoop = RunLoop.current

        while semaphore.wait(timeout: .now()) == .timedOut {
            runLoop.run(mode: .default, before: .distantFuture)
        }
    }
    
    @objc func disconnect() -> Void {
        self._connceted = false;
        self._eventsource?.stop();
        print("disconnected")
    }
    
    private func setUpConfig(url: String, options: NSObject) -> LDSwiftEventSource.EventSource.Config {
        let method = (options.value(forKey: "method") as? String) ?? "GET"
        let body = (options.value(forKey: "body") as? Dictionary) ?? Dictionary<String, String>()
        
        print(body)
        
        if method != "GET" || method != "POST" {
            // error
        }
        
        var config = LDSwiftEventSource.EventSource.Config(
            handler: EventHandler(parent: self),
            url: URL(string: url)!
        );
        
        config.method = method;
        config.headers = options.value(forKey: "headers") as? Dictionary ?? Dictionary<String, String>()
        config.lastEventId = options.value(forKey: "lastEventId") as? String ?? "";
        // TODO add body
        
        return config;
    }
    
    @objc func log(message: String) -> Void {
//        RCTLogInfo("[react-native-event-source] \(message)")
    }
    
    @objc func warn(message: String) -> Void {
//        RCTLogInfo("[react-native-event-source] \(message)")
    }
}

class EventHandler: LDSwiftEventSource.EventHandler
{
    var _eventsource: EventSource?
    
    init(parent: EventSource) {
        self._eventsource = parent
    }
    
    func sendEvent(event: EventType, data: Any?) {
        self._eventsource?.sendEvent(withName: event.rawValue, body: data)
    }
    
    func onOpened() { 
        print("The connection is open")
        self.sendEvent(event: EventType.OPEN, data: nil)
    }

    func onClosed() { 
        print("The connection is closed")
        self.sendEvent(event: EventType.CLOSE, data: nil)
    }

    func onMessage(eventType: String, messageEvent: MessageEvent) {
        print("A message has been received of type \(eventType) \(messageEvent.data) \(messageEvent.lastEventId)")
        self.sendEvent(event: EventType.MESSAGE, data: messageEvent)
    }

    func onComment(comment: String) { 
        print("A comment has been received: \(comment)") 
    }

    func onError(error: Error) {
        print("An error has occurred \(error)")
        self.sendEvent(event: EventType.ERROR, data: error)
    }
}
