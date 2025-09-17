import { type TelemetryData } from '../types';

// FIX: Add missing Web Bluetooth API type definitions.
// These types are not included by default in TypeScript's DOM library and are defined here
// to resolve compilation errors without adding external dependencies like @types/web-bluetooth.
declare global {
  interface Navigator {
    bluetooth: Bluetooth;
  }

  interface Bluetooth {
    requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
  }

  interface RequestDeviceOptions {
    filters?: { services?: string[] }[];
    optionalServices?: string[];
  }

  interface BluetoothDevice extends EventTarget {
    readonly gatt?: BluetoothRemoteGATTServer;
    // FIX: Add missing `id` and `name` properties to the BluetoothDevice interface
    // to match the Web Bluetooth API specification and fix compile errors.
    readonly id: string;
    readonly name?: string;
  }

  interface BluetoothRemoteGATTServer {
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
    readonly connected: boolean;
  }

  interface BluetoothRemoteGATTService {
    getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
  }

  interface BluetoothRemoteGATTCharacteristic extends EventTarget {
    readonly value?: DataView;
    startNotifications(): Promise<void>;
    stopNotifications(): Promise<void>;
  }
}


// ===================================================================================
// ESP32 / Arduino Code Guidance
// ===================================================================================
// To use this web app, you need to program your ESP32 with a compatible BLE sketch.
//
// 1. Define a BLE Service and a Characteristic with the following UUIDs:
const TELEMETRY_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const TELEMETRY_CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
//
// 2. **CRITICAL**: Your ESP32 must advertise the `TELEMETRY_SERVICE_UUID`. If it does not,
//    the browser will NOT be able to find it. This is the most common connection issue.
//
// 3. The characteristic should have NOTIFY properties.
//
// 4. Your ESP32 should read its sensor data and package it into a 14-byte array.
//
// DATA PACKET STRUCTURE (14 bytes total, Little Endian):
// -------------------------------------------------------------------------------------------------------------------------------------------------
// | Bytes 0-1         | Byte 2       | Bytes 3-4         | Byte 5       | Bytes 6-7         | Byte 8       | Bytes 9-10        | Bytes 11-12   | Byte 13         |
// |-------------------|--------------|-------------------|--------------|-------------------|--------------|-------------------|---------------|-----------------|
// | Battery Voltage   | Battery Temp | Battery Current   | Battery SoC  | Motor Voltage     | Motor Temp   | Motor Current     | Motor RPM     | Vehicle Speed   |
// | (uint16_t) * 10   | (uint8_t)    | (int16_t) * 100   | (uint8_t) %  | (uint16_t) * 10   | (uint8_t)    | (int16_t) * 100   | (uint16_t)    | (uint8_t) km/h  |
// -------------------------------------------------------------------------------------------------------------------------------------------------
//
// Example:
// - Battery Voltage = 401.2V -> Send 4012
// - Battery Current = -15.25A -> Send -1525 (negative for regenerative braking)
// - Battery SoC = 88% -> Send 88
//
// Arduino C++ (ESP32) Snippet:
/*
  #include <BLEDevice.h>
  // ... (rest of includes)
  
  // ... (UUIDs and characteristic definition) ...
  
  void loop() {
    uint8_t buffer[14];
    
    // Values are examples. Replace with your actual sensor readings.
    uint16_t batVoltage = 4012; // 401.2V
    uint8_t batTemp = 28; // 28C
    int16_t batCurrent = -1525; // -15.25A
    uint8_t batSoc = 88; // 88%
    uint16_t motVoltage = 3987; // 398.7V
    uint8_t motTemp = 55; // 55C
    int16_t motCurrent = 4550; // 45.50A
    uint16_t motRpm = 1500;
    uint8_t vehicleSpeed = 65; // 65 km/h

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
*/
// ===================================================================================

type DataCallback = (data: Omit<TelemetryData, 'timestamp'>) => void;

class BluetoothService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private onDataReceived: DataCallback | null = null;

  private handleCharacteristicValueChanged = (event: Event) => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    if (!value || value.byteLength < 14) {
      console.warn('Received incomplete data packet.');
      return;
    }
    
    const dataView = new DataView(value.buffer);
    
    const batteryVoltage = dataView.getUint16(0, true) / 10.0;
    const batteryTemperature = dataView.getUint8(2);
    const batteryCurrent = dataView.getInt16(3, true) / 100.0;
    const batterySoc = dataView.getUint8(5);
    const motorVoltage = dataView.getUint16(6, true) / 10.0;
    const motorTemperature = dataView.getUint8(8);
    const motorCurrent = dataView.getInt16(9, true) / 100.0;
    const rpm = dataView.getUint16(11, true);
    const speed = dataView.getUint8(13);
    
    const telemetry: Omit<TelemetryData, 'timestamp'> = {
      battery: { voltage: batteryVoltage, temperature: batteryTemperature, current: batteryCurrent, soc: batterySoc },
      motor: { voltage: motorVoltage, temperature: motorTemperature, rpm, current: motorCurrent },
      vehicle: { speed },
    };
    
    if (this.onDataReceived) {
      this.onDataReceived(telemetry);
    }
  }

  private handleDisconnectEvent = () => {
    this.disconnect();
  };

  async connect(onDataCallback: DataCallback): Promise<string> {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth API is not available on this browser. Please use Chrome or Edge.');
    }
    
    this.onDataReceived = onDataCallback;

    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [TELEMETRY_SERVICE_UUID] }],
        optionalServices: [TELEMETRY_SERVICE_UUID]
      });

      if (!this.device) {
        throw new Error('No device selected.');
      }

      this.device.addEventListener('gattserverdisconnected', this.handleDisconnectEvent);

      this.server = await this.device.gatt?.connect();

      if (!this.server) {
        throw new Error('Could not connect to GATT server.');
      }

      const service = await this.server.getPrimaryService(TELEMETRY_SERVICE_UUID);
      this.characteristic = await service.getCharacteristic(TELEMETRY_CHARACTERISTIC_UUID);

      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', this.handleCharacteristicValueChanged);
      
      return this.device.name ?? 'Unnamed Bluetooth Device';

    } catch (error) {
      console.error("Bluetooth connection process failed:", error);
      if (this.device?.gatt?.connected) {
          this.device.gatt.disconnect();
      }
      this.device = null;
      this.server = null;
      this.characteristic = null;
      
      const errorMessage = (error as Error).name === 'NotFoundError' 
        ? "Device selection was cancelled." 
        : "Connection failed. Please ensure your device is advertising the correct service UUID and is in range.";
        
      throw new Error(errorMessage);
    }
  }

  async disconnect() {
    if (this.characteristic) {
        try {
            await this.characteristic.stopNotifications();
            this.characteristic.removeEventListener('characteristicvaluechanged', this.handleCharacteristicValueChanged);
        } catch (error) {
            console.error('Error stopping notifications:', error);
        }
    }
    if (this.device) {
        this.device.removeEventListener('gattserverdisconnected', this.handleDisconnectEvent);
        if (this.device.gatt?.connected) {
            this.device.gatt.disconnect();
        }
    }
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.onDataReceived = null;
    console.log('Disconnected from device.');
  }
}

export const bluetoothService = new BluetoothService();