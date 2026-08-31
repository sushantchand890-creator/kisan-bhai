
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { 
  Bot, 
  Cloud, 
  Image as ImageIcon, 
  Landmark, 
  Loader2, 
  Mic, 
  MicOff, 
  MousePointer2, 
  Send, 
  Sparkles, 
  Sprout, 
  Square, 
  Thermometer, 
  User, 
  Volume2, 
  VolumeX,
  Waves, 
  Wheat, 
  X,
  MessageCircle,
  Volume1
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { geminiService } from '../services/geminiService';
import { getTranslation } from '../translations';
import { useUser } from '../App';
import { ChatMessage, FarmProfile } from '../types';

// Audio Helpers
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const Chat: React.FC = () => {
  const { user } = useUser();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  // Live Mode Refs
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const liveSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const inputAudioContextRef = useRef<AudioContext | null>(null);

  // Check if routed with initial state from Scan Crop Health
  useEffect(() => {
    if (location.state?.initialPrompt || location.state?.initialImage) {
      handleSend(location.state.initialPrompt, location.state.initialImage);
    }
  }, [location.state]);

  useEffect(() => {
    if (!user) return;
    const welcomes: Record<string, string> = {
      'en': "Namaste! I am Kisan-Bhai, your Digital Farmer Advisor. How can I help your fields flourish today?",
      'hi': "नमस्ते! मैं किसान-भाई हूँ, आपका डिजिटल किसान सलाहकार। आज मैं आपकी खेती में कैसे मदद कर सकता हूँ?",
      'pa': "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕਿਸਾਨ-ਭਾਈ ਹਾਂ, ਤੁਹਾਡਾ ਡਿਜੀਟਲ ਕਿਸਾਨ ਸਲਾਹਕਾਰ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਖੇਤੀ ਵਿੱਚ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
      'mr': "नमस्कार! मी किसान-भाई आहे, तुमचा डिजिटल शेतकरी सल्लागार. आज मी तुमच्या शेतीमध्ये कशी मदत करू शकतो?"
    };
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: welcomes[user.language] || welcomes.en }]);
    }
  }, [user?.language]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, isLiveMode]);

  const speakText = async (text: string) => {
    if (!text || text.trim().length === 0) return;

    if (isSpeaking) {
      audioSourceRef.current?.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      const audioData = await geminiService.generateSpeech(text, user?.language);
      if (audioData) {
        if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        const pcmData = decode(audioData);
        const buffer = await decodeAudioData(pcmData, audioContextRef.current, 24000, 1);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsSpeaking(false);
        audioSourceRef.current = source;
        source.start();
      }
    } catch (e) {
      console.error(e);
      setIsSpeaking(false);
    }
  };

  const speakSelection = () => {
    const selection = window.getSelection()?.toString();
    if (selection && selection.trim().length > 0) {
      speakText(selection);
    }
  };

  const startLiveChat = async () => {
    try {
      setIsLiveMode(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      if (!inputAudioContextRef.current) inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
            liveSessionRef.current = { stream, scriptProcessor };
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContextRef.current.destination);
              source.onended = () => liveSourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              liveSourcesRef.current.add(source);
            }
          },
          onerror: (e) => console.error('Live Error:', e),
          onclose: () => setIsLiveMode(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: user?.language === 'hi' ? 'Kore' : 'Zephyr' } } },
          systemInstruction: `You are Kisan-Bhai, the friendly AI Farmer advisor. Talking in ${user?.language}.`,
        },
      });
    } catch (err) {
      console.error(err);
      setIsLiveMode(false);
    }
  };

  const stopLiveChat = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.stream.getTracks().forEach((t: any) => t.stop());
      liveSessionRef.current.scriptProcessor.disconnect();
    }
    setIsLiveMode(false);
    nextStartTimeRef.current = 0;
  };

  const handleSend = async (overrideText?: string, overrideImage?: string) => {
    const messageText = overrideText || input;
    if ((!messageText.trim() && !selectedImage && !overrideImage) || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: messageText || "Analyze this.", image: (overrideImage || selectedImage) || undefined };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentImage = overrideImage || selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await geminiService.chat(messages, messageText, currentImage || undefined, user?.language);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered a minor issue. Please try asking again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const t = getTranslation(user?.language || 'en');
  const suggestions = [
    { text: t.sugCrop, icon: Sprout, color: 'text-brand-600', bg: 'bg-brand-50 border-brand-200/60' },
    { text: t.sugTomato, icon: Wheat, color: 'text-harvest-600', bg: 'bg-harvest-50 border-harvest-200/60' },
    { text: t.sugWater, icon: Thermometer, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200/60' },
    { text: t.sugSchemes, icon: Landmark, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200/60' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-160px)] bg-white/35 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden relative font-sans">
      
      {/* LIVE VOICE MODE FULLSCREEN OVERLAY */}
      {isLiveMode && (
        <div className="absolute inset-0 z-50 bg-gradient-to-b from-brand-950 via-slate-950 to-brand-900 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
          <button 
            onClick={stopLiveChat} 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-3 rounded-full hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center mb-8 shadow-glow-green">
            <div className="absolute inset-0 rounded-full border-4 border-brand-400/40 animate-ping" />
            <Bot className="w-16 h-16 text-white animate-pulse" />
          </div>

          <h2 className="font-heading font-extrabold text-2xl text-white mb-2">Talking with Kisan-Bhai</h2>
          <p className="text-brand-200 text-sm font-medium mb-10 text-center max-w-sm">
            I am listening to your voice in real time. Speak naturally!
          </p>

          <div className="flex items-center gap-1.5 h-10 mb-10">
            {[...Array(5)].map((_, idx) => (
              <span key={idx} className="wave-bar w-2 bg-brand-400 rounded-full animate-wave-bar h-full" />
            ))}
          </div>

          <button 
            onClick={stopLiveChat} 
            className="bg-rose-600 text-white px-8 py-3.5 rounded-2xl font-extrabold text-sm shadow-xl flex items-center gap-2 hover:bg-rose-700 transition-all active:scale-95"
          >
            <Square className="w-4 h-4 fill-current" /> End Voice Session
          </button>
        </div>
      )}

      {/* CHAT HEADER BAR */}
      <div className="p-4 sm:p-5 border-b border-white/50 flex items-center justify-between bg-white/40 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-brand-600/20 ${isSpeaking ? 'animate-pulse' : ''}`}>
              <Bot className="w-7 h-7" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 leading-none">Kisan-Bhai</h2>
              <Sparkles className="w-3.5 h-3.5 text-harvest-500 fill-harvest-400" />
            </div>
            <p className="text-[10px] sm:text-xs text-brand-700 font-bold tracking-wider mt-1 uppercase flex items-center gap-1.5">
              {isSpeaking ? (
                <>
                  <Volume1 className="w-3 h-3 text-brand-600 animate-pulse" />
                  <span>Speaking Advisory...</span>
                </>
              ) : (
                <span>AI Farmer Advisor</span>
              )}
            </p>
          </div>
        </div>

        <button 
          onClick={startLiveChat} 
          className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-md shadow-brand-600/20 active:scale-95"
        >
          <Waves className="w-4 h-4" /> 
          <span className="hidden sm:inline">Start Live Voice</span>
          <span className="sm:hidden">Live Voice</span>
        </button>
      </div>

      {/* MESSAGES TRAJECTORY (SEMI-TRANSPARENT MIDDLE AREA) */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-transparent custom-scrollbar">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex gap-3 max-w-[90%] sm:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0 flex items-center justify-center shadow-xs ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-brand-600 text-white'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={`group relative p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                  : 'bg-white/65 backdrop-blur-xl text-slate-900 rounded-tl-none border border-white/80 shadow-md'
              }`}>
                {msg.image && (
                  <img 
                    src={msg.image} 
                    alt="Uploaded Crop" 
                    className="max-w-xs rounded-xl mb-3 border border-slate-200 shadow-sm object-cover" 
                  />
                )}
                <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm font-medium">{msg.content}</p>
                
                {msg.role === 'assistant' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center gap-3">
                    <button 
                      onClick={() => speakText(msg.content)} 
                      className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-brand-700 hover:text-brand-800 px-2 py-1 rounded-md hover:bg-brand-50/80 transition-colors"
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isSpeaking ? t.stop : t.listen}</span>
                    </button>
                    <button 
                      onClick={speakSelection} 
                      className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 border-l border-slate-200/60 pl-3 px-2 py-1 rounded-md hover:bg-indigo-50/80 transition-colors"
                    >
                      <MousePointer2 className="w-3.5 h-3.5" />
                      <span>{t.readSelection}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* PROMPT SUGGESTIONS CHIPS (GLASSY) */}
        {messages.length === 1 && !isLoading && (
          <div className="space-y-4 pt-6 pb-6">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-center">
              {t.tryAsking}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {suggestions.map((sug, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(sug.text)} 
                  className="flex items-center gap-3.5 p-4 bg-white/50 backdrop-blur-xl border border-white/80 rounded-2xl text-left hover:bg-white/80 hover:shadow-lg transition-all group"
                >
                  <div className={`w-10 h-10 ${sug.bg} border rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    <sug.icon className={`w-4 h-4 ${sug.color}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-snug">{sug.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LOADING INDICATOR */}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white/60 backdrop-blur-md border border-white/80 p-3.5 rounded-2xl flex gap-1.5 shadow-xs">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CHAT INPUT AREA */}
      <div className="p-4 sm:p-5 border-t border-white/50 bg-white/40 backdrop-blur-xl">
        {selectedImage && (
          <div className="relative inline-block mb-3 animate-in zoom-in duration-200">
            <img src={selectedImage} alt="Crop Preview" className="h-16 w-16 object-cover rounded-xl border-2 border-brand-500 shadow-md" />
            <button 
              onClick={() => setSelectedImage(null)} 
              className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setSelectedImage(reader.result as string);
                reader.readAsDataURL(file);
              }
            }} 
            accept="image/*" 
            className="hidden" 
          />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()} 
            className="p-3 text-slate-500 hover:text-brand-600 bg-white/60 hover:bg-white backdrop-blur-md rounded-xl transition-all border border-white/80"
            title="Upload Crop Photo"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder={t.askAnything} 
              className="w-full bg-white/60 backdrop-blur-md border border-white/80 focus:border-brand-500 focus:bg-white/90 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-500 font-medium outline-none transition-all" 
            />
          </div>

          <button 
            type="button"
            onClick={() => handleSend()} 
            disabled={isLoading || (!input.trim() && !selectedImage)} 
            className="p-3 bg-gradient-to-r from-brand-600 to-emerald-600 text-white rounded-xl shadow-md shadow-brand-600/20 hover:from-brand-500 hover:to-emerald-500 disabled:opacity-40 transition-all active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

