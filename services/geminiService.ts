
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChatMessage, FarmProfile, FertilizerAdvice } from "../types";

const CACHE_PREFIX = 'ruralassist_cache_v2_';
const WEATHER_CACHE_TIME = 15 * 60 * 1000; // 15 mins
const ALERTS_CACHE_TIME = 30 * 60 * 1000; // 30 mins

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private getCached<T>(key: string): T | null {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;
    const { data, timestamp, expiry } = JSON.parse(cached);
    if (Date.now() - timestamp > expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  }

  private setCache(key: string, data: any, expiry: number) {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now(),
      expiry
    }));
  }

  private getLanguageContext(lang: string) {
    const maps: Record<string, string> = {
      'hi': "Hindi (हिन्दी)",
      'pa': "Punjabi (ਪੰਜਾਬੀ)",
      'mr': "Marathi (मराठी)",
      'en': "English"
    };
    return `The user's preferred language is ${maps[lang] || 'English'}. Please respond in that language.`;
  }

  private extractJSON(text: string | undefined): any {
    const str = text || '{}';
    
    // Try to extract from markdown code blocks first
    const match = str.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch (e) {
        console.error("Failed to parse extracted JSON from markdown:", match[1]);
      }
    }

    // Try to find the first { and last } if it's an object
    const firstBrace = str.indexOf('{');
    const lastBrace = str.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(str.substring(firstBrace, lastBrace + 1));
      } catch (e) {
        // Ignore and fall through
      }
    }
    
    // Try to find the first [ and last ] if it's an array
    const firstBracket = str.indexOf('[');
    const lastBracket = str.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(str.substring(firstBracket, lastBracket + 1));
      } catch (e) {
        // Ignore and fall through
      }
    }

    // Final fallback
    try {
      return JSON.parse(str.trim());
    } catch (e) {
      console.error("Failed to parse JSON completely:", str);
      return {};
    }
  }

  async generateSpeech(text: string, lang: string = 'en') {
    const ai = this.getAI();
    const voiceName = lang === 'hi' || lang === 'pa' || lang === 'mr' ? 'Kore' : 'Puck';

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say in ${lang}: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }

  async chat(history: ChatMessage[], message: string, imageBase64?: string, lang: 'en' | 'hi' | 'pa' | 'mr' = 'en') {
    const ai = this.getAI();
    const contents: any[] = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const currentParts: any[] = [];
    if (message.trim()) currentParts.push({ text: message });
    if (imageBase64) {
      currentParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64.split(',')[1] || imageBase64
        }
      });
    }

    contents.push({ role: 'user', parts: currentParts });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: {
        systemInstruction: `You are Kisan-Bhai, the friendly AI Farmer advisor. ${this.getLanguageContext(lang)} 
        Help with diseases, irrigation, and crop planning. Use real-time data from Google Search to provide the most up-to-date and accurate information.`,
        tools: [{ googleSearch: {} }]
      }
    });
    return response.text || "I'm sorry, I'm resting my voice right now.";
  }

  async analyzeDisease(imageBase64: string, lang: string = 'en') {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] || imageBase64 } },
          { text: `Analyze crop disease in ${lang}.` }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diseaseName: { type: Type.STRING },
            severity: { type: Type.STRING },
            organicSteps: { type: Type.STRING },
            chemicalSteps: { type: Type.STRING }
          },
          required: ["diseaseName", "severity"]
        }
      }
    });
    return this.extractJSON(response.text);
  }

  async getRealTimeWeather(location: string, lang: string = 'en') {
    const cacheKey = `weather_${location}_${lang}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Use real-time data from Google Search to get the current weather and 5-day forecast for ${location} in ${lang}. Respond strictly in JSON format with this structure: { "current": { "temp": number, "humidity": number, "condition": string, "wind": number, "uv": string }, "forecast": [ { "day": string, "high": number, "low": number, "condition": string } ] }`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    const data = this.extractJSON(response.text);
    this.setCache(cacheKey, data, WEATHER_CACHE_TIME);
    return data;
  }

  async getProactiveAlerts(profile: FarmProfile) {
    const cacheKey = `alerts_${profile.location}_${profile.language}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Use real-time data from Google Search to generate 2 proactive agricultural alerts for ${profile.location} in ${profile.language}. Respond strictly in JSON format with this structure: { "alerts": [ { "title": string, "type": string, "description": string, "urgency": string } ] }`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    const parsed = this.extractJSON(response.text);
    const data = parsed.alerts ? parsed.alerts : (Array.isArray(parsed) ? parsed : []);
    this.setCache(cacheKey, data, ALERTS_CACHE_TIME);
    return data;
  }

  async getFertilizerAdvice(crop: string, soil: string, stage: string, lang: string = 'en'): Promise<FertilizerAdvice> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Fertilizer advice for ${crop} at ${stage} in ${soil} soil in ${lang}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            quantity: { type: Type.STRING },
            timing: { type: Type.STRING },
            applicationMethod: { type: Type.STRING },
            precautions: { type: Type.STRING }
          }
        }
      }
    });
    return this.extractJSON(response.text);
  }

  async getIrrigationAdvice(crop: string, moisture: number, rain: number, lang: string = 'en') {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Irrigation for ${crop}, ${moisture}% moisture, ${rain}mm rain in ${lang}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            waterAmount: { type: Type.STRING },
            duration: { type: Type.STRING },
            urgency: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return this.extractJSON(response.text);
  }

  async checkUpcomingRain(location: string, lang: string = 'en') {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Use real-time data from Google Search to check if heavy rain is predicted in ${location} next 24h. Respond strictly in JSON format with this structure: { "isRainExpected": boolean, "intensity": string, "timing": string, "recommendation": string }`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    const data = this.extractJSON(response.text);
    return data.isRainExpected !== undefined ? data : { isRainExpected: false };
  }

  async getWeatherAlerts(location: string, lang: string = 'en') {
    const cacheKey = `weather_alerts_${location}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Use real-time data from Google Search to find critical weather alerts for farmers in ${location} in ${lang}. Respond strictly in JSON format with this structure: { "alerts": [ { "title": string, "severity": string, "description": string, "action": string } ] }`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    const parsed = this.extractJSON(response.text);
    const data = parsed.alerts ? parsed.alerts : (Array.isArray(parsed) ? parsed : []);
    this.setCache(cacheKey, data, WEATHER_CACHE_TIME);
    return data;
  }

  async analyzeGrowth(imageBase64: string, cropType: string, lang: string = 'en') {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] || imageBase64 } },
          { text: `Growth analysis for ${cropType} in ${lang}.` }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stage: { type: Type.STRING },
            health: { type: Type.STRING },
            analysis: { type: Type.STRING },
            nextSteps: { type: Type.STRING }
          }
        }
      }
    });
    return this.extractJSON(response.text);
  }

  async getSchemes(location: string, lang: string = 'en') {
    const cacheKey = `schemes_${location}_${lang}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Use real-time data from Google Search to find active, currently ongoing Indian agricultural schemes specifically for farmers in ${location} in ${lang}. Exclude any schemes that have ended or are no longer active. Respond strictly in JSON format with this structure: { "schemes": [ { "name": string, "category": string, "description": string, "eligibility": string, "benefits": string } ] }`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    const parsed = this.extractJSON(response.text);
    const data = parsed.schemes ? parsed.schemes : (Array.isArray(parsed) ? parsed : []);
    this.setCache(cacheKey, data, 24 * 60 * 60 * 1000); // 1 day
    return data;
  }

  async getCropRecommendations(location: string, season: string, soil: string, lang: string = 'en') {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Use real-time data from Google Search to recommend crops for ${location}, ${season}, ${soil} in ${lang}. Respond strictly in JSON format with this structure: { "crops": [ { "name": string, "risk": string, "profitPotential": string, "waterNeed": string } ] }`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    const data = this.extractJSON(response.text);
    return data.crops ? data : { crops: Array.isArray(data) ? data : [] };
  }

  async getWeatherAdvice(temp: number, humidity: number, condition: string, lang: string = 'en') {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tips for ${temp}C, ${humidity}%, ${condition} in ${lang}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: { tips: { type: Type.ARRAY, items: { type: Type.STRING } } }
        }
      }
    });
    const parsed = this.extractJSON(response.text);
    return parsed.tips ? parsed.tips : (Array.isArray(parsed) ? parsed : []);
  }

  async getFinancialEstimates(landSize: number, cropType: string, location: string, lang: string = 'en'): Promise<{ seedsCost: number, laborCost: number, fertilizerCost: number, expectedYield: number, marketPrice: number }> {
    const cacheKey = `financials_${landSize}_${cropType}_${location}_${lang}`;
    const cached = this.getCached<{ seedsCost: number, laborCost: number, fertilizerCost: number, expectedYield: number, marketPrice: number }>(cacheKey);
    if (cached) return cached;

    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Use real-time data from Google Search to estimate the farming costs and revenue for ${landSize} acres of ${cropType} in ${location} in ${lang}. Respond strictly in JSON format with this structure: { "seedsCost": number, "laborCost": number, "fertilizerCost": number, "expectedYield": number, "marketPrice": number }`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    const parsed = this.extractJSON(response.text);
    const data = {
      seedsCost: parsed.seedsCost || 0,
      laborCost: parsed.laborCost || 0,
      fertilizerCost: parsed.fertilizerCost || 0,
      expectedYield: parsed.expectedYield || 0,
      marketPrice: parsed.marketPrice || 0,
    };
    this.setCache(cacheKey, data, 24 * 60 * 60 * 1000); // 1 day
    return data;
  }
}

export const geminiService = new GeminiService();
