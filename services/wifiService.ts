import { type TelemetryData } from '../types';

// ===================================================================================
// ESP32 / Arduino Code Guidance (WiFi WebSocket)
// ===================================================================================
// To connect via WiFi, your ESP32 must run a WebSocket server.
//
// 1. Set up your ESP32 to connect to your local WiFi network or run in Access Point (AP) mode.
//
// 2. Use a library like `ESPAsyncWebServer` with its WebSocket plugin.
//
// 3. Create a WebSocket server on a specific port (e.g., 80).
//
// 4. When a client connects, periodically send telemetry data as a JSON string.
//
// DATA FORMAT:
// The server should send a JSON string that matches the TelemetryData interface.
// Example JSON string to send:
// {
//   "battery": {"voltage": 401.2, "temperature": 28, "current": -15.25, "soc": 88},
//   "motor": {"voltage": 399.8, "temperature": 55, "rpm": 1500, "current": 45.5},
//   "vehicle": {"speed": 65}
// }
//
// Arduino C++ (ESP32) Snippet:
/*
  #include <WiFi.h>
  #include <ESPAsyncWebServer.h>
  #include <ArduinoJson.h> // You will need to install this library

  // ... (WiFi credentials and server setup) ...

  void loop() {
    // Send data to all connected clients every second
    JsonDocument doc;
    doc["battery"]["voltage"] = 401.2;
    doc["battery"]["temperature"] = 28;
    doc["battery"]["current"] = -15.25;
    doc["battery"]["soc"] = 88;

    doc["motor"]["voltage"] = 399.8;
    doc["motor"]["temperature"] = 55;
    doc["motor"]["rpm"] = 1500;
    doc["motor"]["current"] = 45.5;

    doc["vehicle"]["speed"] = 65;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    ws.textAll(jsonString);
    
    delay(1000);
  }
*/
// ===================================================================================

type DataCallback = (data: Omit<TelemetryData, 'timestamp'>) => void;

class WifiService {
    private ws: WebSocket | null = null;
    private onDataReceived: (DataCallback) | null = null;
    private onDisconnectCallback: (() => void) | null = null;

    connect(url: string, onDataCallback: DataCallback, onDisconnectCallback: () => void) {
        return new Promise<void>((resolve, reject) => {
            if (this.ws) {
                this.disconnect();
            }

            try {
                this.ws = new WebSocket(url);
            } catch (error) {
                 // FIX: Check for SecurityError by its name property for robustness.
                 if (error instanceof Error && error.name === 'SecurityError') {
                     return reject(new Error("Cannot connect to an insecure (ws://) WebSocket from a secure (https://) page. Please test using a local http server."));
                 }
                 return reject(new Error('Invalid WebSocket URL provided.'));
            }

            this.onDataReceived = onDataCallback;
            this.onDisconnectCallback = onDisconnectCallback;

            this.ws.onopen = () => {
                console.log('WebSocket connection established.');
                resolve();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data: Omit<TelemetryData, 'timestamp'> = JSON.parse(event.data);
                    // More robust check for the new data structure
                    if (data.battery && data.motor && data.vehicle) {
                         if (this.onDataReceived) {
                           this.onDataReceived(data);
                         }
                    } else {
                        console.warn('Received malformed telemetry data via WebSocket:', event.data);
                    }
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.disconnect();
                reject(new Error('Could not connect to the WebSocket server. Please check the URL and device.'));
            };

            this.ws.onclose = () => {
                console.log('WebSocket connection closed.');
                if (this.onDisconnectCallback) {
                  this.onDisconnectCallback();
                }
                this.cleanup();
            };
        });
    }
    
    disconnect() {
        if (this.ws) {
            this.ws.onclose = null; // Prevent onclose from firing during manual disconnect
            this.ws.close();
        }
        this.cleanup();
    }
    
    private cleanup() {
       this.ws = null;
       this.onDataReceived = null;
       this.onDisconnectCallback = null;
    }
}

export const wifiService = new WifiService();