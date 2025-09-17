# EV Telemetry Fault Detection Dashboard

This application is a real-time monitoring and diagnostics dashboard for electric vehicle (EV) systems. It wirelessly collects and displays sensor data from an ESP32 device and leverages the Google Gemini API to provide AI-powered fault predictions, analysis, and conversational insights.

![App Screenshot](https://storage.googleapis.com/aistudio-ux-team/project-announcement-UX/1.4.0/walkthrough-light.gif)

## Core Features

-   **Real-time Telemetry Dashboard**: Monitors key metrics like Battery/Motor Voltage, Temperature, Current, RPM, Vehicle Speed, and Battery SoC.
-   **Live AI Fault Detection**: Periodically sends telemetry data to the Google Gemini API to analyze system health, predict faults, and provide actionable recommendations.
-   **Interactive AI Chatbot**: A conversational assistant that answers questions about the vehicle's status based on live data.
-   **Historical Data Visualization**: An "AI Analysis" screen with interactive time-series charts to track sensor data over time.
-   **Dual Connection Methods**: Supports both Bluetooth Low Energy (BLE) and WiFi (WebSocket) for flexible hardware integration.
-   **Fully Responsive Design**: A clean, modern UI that works seamlessly on both mobile devices and desktops.

---

## How to Use & Setup Guide

### Step 1: API Key Configuration (Crucial for AI Features)

The AI-powered features (Fault Diagnostics and Chatbot) require a Google Gemini API key.

1.  **Obtain a Key**: Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  **Create a `.env` File**: In the root directory of this project, create a new file named `.env`.
3.  **Add the Key**: Inside the `.env` file, add the following line, replacing `YOUR_GEMINI_API_KEY` with the key you obtained:
    ```
    API_KEY=YOUR_GEMINI_API_KEY
    ```
4.  **Restart Server**: If you are running a local development server, you **must restart it** for the key to be recognized.

> **Note on Deployment**: If you deploy this application, you must configure the `API_KEY` as an environment variable in your hosting provider's settings. A missing key will cause the AI features to fail.

### Step 2: Hardware Setup (ESP32)

You need to program an ESP32 microcontroller to send data in a specific format. Choose either the Bluetooth or WiFi method below.

#### Method A: Bluetooth Low Energy (BLE)

This is the recommended method for mobile use.

-   **UUIDs**: Your ESP32 sketch must use the following Service and Characteristic UUIDs.
    -   Service UUID: `4fafc201-1fb5-459e-8fcc-c5c9c331914b`
    -   Characteristic UUID: `beb5483e-36e1-4688-b7f5-ea07361b26a8`
-   **Advertising**: **Your ESP32 must advertise the Service UUID**, otherwise the browser will not be able to find it.
-   **Data Packet Structure**: The data must be sent as a **14-byte array** with Little Endian byte order.

| Bytes 0-1       | Byte 2     | Bytes 3-4       | Byte 5     | Bytes 6-7     | Byte 8     | Bytes 9-10      | Bytes 11-12 | Byte 13       |
| --------------- | ---------- | --------------- | ---------- | ------------- | ---------- | --------------- | ----------- | ------------- |
| Battery Voltage | Batt Temp  | Battery Current | Batt SoC % | Motor Voltage | Motor Temp | Motor Current   | Motor RPM   | Vehicle Speed |
| (uint16_t) * 10 | (uint8_t)  | (int16_t) * 100 | (uint8_t)  | (uint16_t) * 10 | (uint8_t)  | (int16_t) * 100 | (uint16_t)  | (uint8_t) km/h|

**Example Arduino (ESP32) BLE Snippet:**
```cpp
#include <BLEDevice.h>

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLECharacteristic telemetryCharacteristic(CHARACTERISTIC_UUID, BLECharacteristic::PROPERTY_NOTIFY);

void setup() {
  // ... (Serial, BLEDevice::init, etc.) ...
  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService(SERVICE_UUID);
  pService->addCharacteristic(&telemetryCharacteristic);
  pService->start();
  // IMPORTANT: Advertise the service
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->start();
}

void loop() {
    uint8_t buffer[14];
    
    // Replace with your actual sensor readings
    uint16_t batVoltage = 4012; // 401.2V
    uint8_t  batTemp = 28;      // 28 C
    int16_t  batCurrent = -1525;// -15.25A
    uint8_t  batSoc = 88;       // 88%
    uint16_t motVoltage = 3987; // 398.7V
    uint8_t  motTemp = 55;      // 55 C
    int16_t  motCurrent = 4550; // 45.50A
    uint16_t motRpm = 1500;
    uint8_t  vehicleSpeed = 65; // 65 km/h

    memcpy(buffer + 0, &batVoltage, 2);
    memcpy(buffer + 2, &batTemp, 1);
    memcpy(buffer + 3, &batCurrent, 2);
    memcpy(buffer + 5, &batSoc, 1);
    memcpy(buffer + 6, &motVoltage, 2);
    memcpy(buffer + 8, &motTemp, 1);
    memcpy(buffer + 9, &motCurrent, 2);
    memcpy(buffer + 11, &motRpm, 2);
    memcpy(buffer + 13, &vehicleSpeed, 1);
    
    telemetryCharacteristic.setValue(buffer, 14);
    telemetryCharacteristic.notify();
    
    delay(1000); // Send data every second
}
```

#### Method B: WiFi (WebSocket)

-   **Setup**: Your ESP32 must run a WebSocket server. It can either create its own Access Point (AP) or connect to an existing WiFi network.
-   **Data Format**: The server should send a JSON string every second that matches the application's data structure.

**Example Arduino (ESP32) WebSocket Snippet:**
```cpp
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

void onWebSocketEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
    // Handle connect/disconnect events if needed
}

void setup() {
    // ... (Serial, WiFi setup) ...
    ws.onEvent(onWebSocketEvent);
    server.addHandler(&ws);
    server.begin();
}

void loop() {
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
    
    ws.textAll(jsonString); // Send to all connected clients
    
    delay(1000); // Send data every second
}
```

### Step 3: Using the Application

1.  **Navigate**: Use the footer icons to switch between the **Dashboard**, **AI Analysis**, and **Device** screens.
2.  **Connect**: Go to the **Device** screen and tap "Connect to Vehicle".
3.  **Choose Method**: Select either Bluetooth or WiFi and follow the on-screen prompts.
4.  **Monitor**: Once connected, the Dashboard will display live data, and the AI Diagnostics will begin analyzing your system.
5.  **Analyze & Chat**: Go to the AI Analysis screen to view historical charts and ask the AI chatbot questions about your vehicle's status.

---

## Technology Stack

-   **Frontend**: React, TypeScript
-   **Styling**: Tailwind CSS
-   **Charting**: Recharts
-   **AI**: Google Gemini API (`@google/genai`)
-   **Connectivity**: Web Bluetooth API, WebSockets

---

## Troubleshooting

-   **Blank Screen on Deploy**: This is almost always caused by a missing `API_KEY` environment variable in your hosting provider's settings.
-   **Bluetooth Device Not Found**: Ensure your ESP32 is advertising the correct Service UUID (`4fafc201...`). This is the most common reason for discovery failure.
-   **WiFi Connection Fails**: If you are accessing the app via a secure `https://` URL, you cannot connect to an insecure `ws://` WebSocket server on your local network due to browser security policies. For testing, access your app via a local `http://` server.