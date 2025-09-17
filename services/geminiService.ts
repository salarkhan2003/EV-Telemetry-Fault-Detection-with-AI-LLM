import { GoogleGenAI, Type } from "@google/genai";
import { type TelemetryData, type FaultAnalysis, FaultStatus } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    status: { 
      type: Type.STRING,
      enum: [FaultStatus.Healthy, FaultStatus.Warning, FaultStatus.Critical],
      description: 'The overall system health status.'
    },
    analysis: { 
      type: Type.STRING,
      description: 'A concise, human-readable summary of the telemetry data analysis, limited to 2-3 sentences.'
    },
    recommendation: { 
      type: Type.STRING,
      description: 'A clear, actionable recommendation for the user. For HEALTHY status, this can be a simple "No action required."'
    },
  },
  required: ['status', 'analysis', 'recommendation'],
};

export async function analyzeTelemetry(data: TelemetryData): Promise<FaultAnalysis> {
  const prompt = `
    You are an expert AI assistant for electric vehicle diagnostics. 
    Analyze the following real-time telemetry data from a vehicle's battery, motor, and general systems.
    
    Telemetry Data:
    ${JSON.stringify(
        { battery: data.battery, motor: data.motor, vehicle: data.vehicle }, 
        null, 
        2
    )}

    Normal Operating Ranges:
    - Battery Voltage: 380V - 410V
    - Battery Temperature: 15°C - 40°C
    - Battery Current: -30A (regen) to 100A (discharge). Values outside -50A to 150A are critical.
    - Battery SoC: 20% - 95%. Below 10% is critical.
    - Motor Temperature: 40°C - 90°C. Above 120°C is critical.
    - Motor Current: Should be proportional to load. High current at low RPM can indicate a stall.
    - Motor Voltage: Should be slightly less than battery voltage. A large discrepancy indicates high load or a fault.
    - Vehicle Speed: Should correlate with Motor RPM. If RPM is high but speed is 0, it could indicate a drivetrain issue.

    Your task is to detect any existing faults and predict potential future faults.
    Provide your analysis in the specified JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText) as FaultAnalysis;

    if (!Object.values(FaultStatus).includes(parsedJson.status)) {
        throw new Error(`Invalid status value received from API: ${parsedJson.status}`);
    }

    return parsedJson;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to parse or receive valid analysis from Gemini API.");
  }
}

export async function getChatbotResponse(question: string, telemetry: TelemetryData): Promise<string> {
    const prompt = `
    You are a helpful and concise AI vehicle assistant.
    A user is asking a question about their electric vehicle's current status.
    Answer the question based *only* on the real-time telemetry data provided below.
    Keep your answers short, clear, and directly related to the user's question.
    Do not make up information. If the data is not available or is zero, say so.

    Current Telemetry Data:
    ${JSON.stringify(
        { battery: telemetry.battery, motor: telemetry.motor, vehicle: telemetry.vehicle },
        null,
        2
    )}
    
    Normal Operating Ranges:
    - Battery Voltage: 380V - 410V
    - Battery Temperature: 15°C - 40°C
    - Battery SoC: 20% - 95%
    - Motor Temperature: 40°C - 90°C

    User's Question: "${question}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for chatbot:", error);
    throw new Error("Failed to get a response from the AI assistant.");
  }
}