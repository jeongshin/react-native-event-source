package com.eventsource

import androidx.annotation.WorkerThread
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import okhttp3.Response
import java.util.concurrent.TimeUnit
import okhttp3.sse.EventSource
import okhttp3.sse.EventSourceListener
import okhttp3.sse.EventSources
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.Arguments
import okhttp3.MediaType
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody

class EventSourceModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private lateinit var eventSource: EventSource

  final val VALID_EVENTS: Array<String> = arrayOf<String>("open","close","message","error")

  override fun getName(): String {
    return NAME
  }

  /**
   * init event source instance
   *
   * @param url endpoint
   * @param options { method: "GET" | "POST", headers: HashMap<String, String>, body: String, timeout: Int }
   *
   */
  @ReactMethod
  fun initialize(url: String, options: ReadableMap) {
    var request = Request.Builder()
      .url(url)
      .header("Content-Type", "application/json")
      .addHeader("Accept", "text/event-source")
      .addHeader("Accept", "application/json")

    var timeout = if (options.hasKey("timeout")) options.getInt("timeout") else 30 * 1000
    var headers = if (options.hasKey("headers")) options.getMap("headers")?.toHashMap() else HashMap()
    var method = if (options.hasKey("method")) options.getString("method") ?: "GET" else "GET"
    var body = if (options.hasKey("body")) options.getString("body") ?: "" else ""

    // init httpClient
    val httpClient = OkHttpClient.Builder()
      .connectTimeout(timeout.toLong(), TimeUnit.MILLISECONDS)
      .readTimeout(timeout.toLong(), TimeUnit.MILLISECONDS)
      .writeTimeout(timeout.toLong(), TimeUnit.MILLISECONDS)
      .retryOnConnectionFailure(false)
      .build()

    // inject custom headers
    headers?.entries?.forEach{ (key, value) ->
        run {
          request.addHeader(key, value.toString())
        }
    }

    this.log("method $method timeout ${timeout.toLong()} headers $headers url $url")

    if (method == "POST") {
      request.post(body.toRequestBody("application/json".toMediaTypeOrNull()))
    } else if (method == "GET")  {
      request.get()
    } else {
      throw Exception("[react-native-event-source] method should be GET or POST")
    }

    val listeners = object : EventSourceListener() {
      @WorkerThread
      override fun onOpen(eventSource: EventSource, response: Response) {
        super.onOpen(eventSource, response)
        this@EventSourceModule.log("opened $response")
        this@EventSourceModule.sendEvent("open", "data", "")
      }

      @WorkerThread
      override fun onEvent(eventSource: EventSource, id: String?, type: String?, data: String) {
        super.onEvent(eventSource, id, type, data)
        this@EventSourceModule.log("message $data")
        this@EventSourceModule.sendEvent("message", "data", data)
      }

      @WorkerThread
      override fun onFailure(eventSource: EventSource, t: Throwable?, response: Response?) {
        super.onFailure(eventSource, t, response)
        this@EventSourceModule.log("failed $t $response")
        this@EventSourceModule.sendEvent("error", "data", response.toString())
      }

      @WorkerThread
      override fun onClosed(eventSource: EventSource) {
        super.onClosed(eventSource)
        this@EventSourceModule.log("closed")
        this@EventSourceModule.sendEvent("close", "data", "null")
      }
    }

    this.eventSource = EventSources.createFactory(httpClient).newEventSource(request = request.build(), listener = listeners)

    this.eventSource.request()
  }

  private fun sendEvent(event: String, key: String, value: String) {
    if (!this.VALID_EVENTS.contains(event)) {
      this.log("invalid event")
      return;
    }

    val params: WritableMap = Arguments.createMap().apply {
      putString(key, value)
    }

    this.reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(event, params)
  }

  private fun log(msg: String) {
    println("[react-native-event-source] $msg")
  }

  companion object {
    const val NAME = "EventSource"
  }
}
