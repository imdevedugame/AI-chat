import React from 'react';
import { Message } from '../types';
import { Bot, User, Volume2, Star } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onSpeakMessage?: (text: string) => void;
  onToggleFavorite?: (messageId: string) => void;
}

export function ChatMessage({ message, onSpeakMessage, onToggleFavorite }: ChatMessageProps) {
  const isAI = message.sender === 'ai';
  
  if (message.isTyping) {
    return (
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center glass-effect">
          <Bot className="w-6 h-6" />
        </div>
        <div className="flex-1 max-w-[80%] rounded-2xl p-4 message-container">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex items-start gap-4 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center glass-effect`}>
        {isAI ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
      </div>
      <div className={`flex-1 max-w-[80%] rounded-2xl p-4 message-container relative group`}>
        <p className="text-white">{message.content}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-300">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(message.id)}
                className={`p-1 rounded-full hover:bg-white/20 transition-all ${
                  message.isFavorite ? 'text-yellow-400' : 'opacity-0 group-hover:opacity-100'
                }`}
                title={message.isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
              >
                <Star className="w-4 h-4" fill={message.isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
            {isAI && onSpeakMessage && (
              <button
                onClick={() => onSpeakMessage(message.content)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-white/20"
                title="Putar suara"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}