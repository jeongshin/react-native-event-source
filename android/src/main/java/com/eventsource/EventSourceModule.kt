package com.eventsource

import androidx.annotation.WorkerThread
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import okhttp3.Response
import java.util.concurrent.TimeUnit
import okhttp3.sse.EventSource
import okhttp3.sse.EventSourceListener
import okhttp3.sse.EventSources

class EventSourceModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private lateinit var eventSource: EventSource

  override fun getName(): String {
    return NAME
  }

  /**
   * init event source instance
   *
   * @param url endpoint
   * @param options { method: "GET" | "POST", headers: HashMap<String, Any>, body: String, timeout: Int }
   *
   */
  @ReactMethod
  fun initialize(url: String, options: ReadableMap) {
    var request = Request.Builder()
      .url(url)
      .header("Content-Type", "application/json")
      .addHeader("Accept", "text/event-source")

    var timeout = if (options.hasKey("timeout")) options.getInt("timeout") else 30 * 1000

    val sseClient = OkHttpClient.Builder()
      .connectTimeout(timeout.toLong(), TimeUnit.MILLISECONDS)
      .readTimeout(timeout.toLong(), TimeUnit.MILLISECONDS)
      .writeTimeout(timeout.toLong(), TimeUnit.MILLISECONDS)
      .build()

    var headers = if (options.hasKey("headers")) options.getMap("headers")?.toHashMap() else HashMap()

    headers?.entries?.forEach{ (key, value) ->
        run {
          request.addHeader(key, value.toString())
        }
    }

    var method = if (options.hasKey("method")) options.getString("method") else "GET"

    println("[react-native-event-source] method $method");
    println("[react-native-event-source] headers $headers")

    if (method == "POST") {
      // request.post(RequestBody.)
    } else if (method == "GET")  {
      request.get()
    } else {
      throw Exception("[react-native-event-source] method should be POST or GET")
    }

    val listeners = object : EventSourceListener() {
      @WorkerThread
      override fun onOpen(eventSource: EventSource, response: Response) {
        super.onOpen(eventSource, response)
        println("opened!!")
        this@EventSourceModule.emit("onOpened", hashMapOf("data" to null))
      }

      @WorkerThread
      override fun onEvent(eventSource: EventSource, id: String?, type: String?, data: String) {
        super.onEvent(eventSource, id, type, data)
        println("data $data")
        this@EventSourceModule.emit("onMessage", hashMapOf("data" to data))
      }

      @WorkerThread
      override fun onFailure(eventSource: EventSource, t: Throwable?, response: Response?) {
        super.onFailure(eventSource, t, response)
        println("Failed $response $t")
        this@EventSourceModule.emit("onError", hashMapOf("error" to t, "data" to response))
      }

      @WorkerThread
      override fun onClosed(eventSource: EventSource) {
        super.onClosed(eventSource)
        println("closed")
        this@EventSourceModule.emit("onClosed", hashMapOf("data" to null))
      }
    }

    // this.eventSource = EventSources.createFactory(sseClient).newEventSource(requiest.build(), listeners)

    // this.eventSource.request()
  }

  private fun <T> emit(event: String, data: T) {
    this.reactApplicationContext.getJSModule(RCTDeviceEventEmitter::class.java).emit(event, data)
  }

  companion object {
    const val NAME = "EventSource"
  }
}
