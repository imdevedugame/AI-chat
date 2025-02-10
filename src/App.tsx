import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, Send, MessageSquare, Volume2, VolumeX, Settings, Star, Trash2, Sun, Moon } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { getAIResponse } from './api';
import { Message, ChatSettings } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    voiceSpeed: 1,
    voicePitch: 1,
    darkMode: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesis = window.speechSynthesis;
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    document.body.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  const speakText = (text: string) => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = settings.voiceSpeed;
    utterance.pitch = settings.voicePitch;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleFavorite = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isFavorite: !msg.isFavorite } : msg
    ));
  };

  const clearChat = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua pesan?')) {
      setMessages([]);
      stopSpeaking();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    resetTranscript();
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      content: 'AI sedang mengetik...',
      sender: 'ai',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await getAIResponse(input);
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      
      if (isVoiceMode) {
        speakText(response);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      stopSpeaking();
      SpeechRecognition.startListening({ continuous: true, language: 'id' });
    }
  };

  const toggleMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (listening) {
      SpeechRecognition.stopListening();
    }
    stopSpeaking();
  };

  return (
    <div className={`min-h-screen chat-background text-white transition-colors duration-300 ${settings.darkMode ? 'dark' : ''}`}>
      <div className="max-w-3xl mx-auto p-4 h-screen flex flex-col">
        <header className="text-center py-6 glass-effect rounded-lg mb-4">
          <div className="flex justify-end px-4">
            <button
              onClick={() => setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
              className="p-2 rounded-full glass-effect hover:bg-white/20 transition-all"
              title={settings.darkMode ? 'Mode Terang' : 'Mode Gelap'}
            >
              {settings.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full glass-effect hover:bg-white/20 transition-all ml-2"
              title="Pengaturan"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={clearChat}
              className="p-2 rounded-full glass-effect hover:bg-red-500/20 transition-all ml-2"
              title="Hapus Chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          <h1 className="text-3xl font-bold">AI Companion Chat</h1>
          <p className="text-gray-200 mt-2">Berbincang dengan AI dalam Bahasa Indonesia</p>
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={toggleMode}
              className="px-4 py-2 rounded-full glass-effect hover:bg-white/20 transition-all flex items-center gap-2"
            >
              {isVoiceMode ? (
                <>
                  <MessageSquare className="w-5 h-5" />
                  Mode Chat
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  Mode Suara
                </>
              )}
            </button>
            {isVoiceMode && isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-4 py-2 rounded-full glass-effect hover:bg-red-500/20 transition-all flex items-center gap-2"
              >
                <VolumeX className="w-5 h-5" />
                Stop Suara
              </button>
            )}
          </div>
          
          {showSettings && (
            <div className="mt-4 p-4 glass-effect rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Pengaturan Suara</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Kecepatan Suara: {settings.voiceSpeed}x</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.voiceSpeed}
                    onChange={(e) => setSettings(prev => ({ ...prev, voiceSpeed: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Nada Suara: {settings.voicePitch}x</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.voicePitch}
                    onChange={(e) => setSettings(prev => ({ ...prev, voicePitch: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto space-y-6 px-4">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message}
              onSpeakMessage={isVoiceMode ? speakText : undefined}
              onToggleFavorite={toggleFavorite}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="mt-4 glass-effect rounded-lg p-4">
          <div className="flex items-center gap-2">
            {isVoiceMode ? (
              browserSupportsSpeechRecognition && (
                <button
                  onClick={toggleListening}
                  className={`flex-1 p-4 rounded-lg glass-effect ${
                    listening ? 'bg-red-500/20' : 'hover:bg-white/20'
                  } transition-all flex items-center justify-center gap-2`}
                >
                  {listening ? (
                    <>
                      <MicOff className="w-6 h-6" />
                      Berhenti Mendengarkan
                    </>
                  ) : (
                    <>
                      <Mic className="w-6 h-6" />
                      Mulai Berbicara
                    </>
                  )}
                </button>
              )
            ) : (
              <>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ketik pesanmu di sini..."
                  className="flex-1 p-3 rounded-lg glass-effect focus:outline-none focus:ring-2 focus:ring-white/50"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="p-3 rounded-lg glass-effect hover:bg-white/20 transition-all disabled:opacity-50"
                >
                  <Send className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
          {isVoiceMode && listening && (
            <div className="mt-2 text-sm text-gray-200 text-center">
              {transcript || 'Mulai berbicara...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;