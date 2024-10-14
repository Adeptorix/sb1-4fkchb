import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader } from 'lucide-react';
import MatrixRain from './components/MatrixRain';
import ChatMessage from './components/ChatMessage';

const WEBHOOK_URL = 'https://hook.eu2.make.com/ymrirgtspure7mg4fj6ko3ouiovpyp2m';
const TIMEOUT_DURATION = 60000; // 60 seconds timeout

function App() {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [input, setInput] = useState('');
  const [isRaining, setIsRaining] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isWaiting) {
      setMessages([...messages, { text: input, isUser: true }]);
      setInput('');
      setIsRaining(true);
      setIsWaiting(true);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_DURATION)
      );

      try {
        const responsePromise = fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input }),
        });

        const response = await Promise.race([responsePromise, timeoutPromise]);
        if (!response || !('ok' in response)) {
          throw new Error('Network response was not ok');
        }
        if (response.status === 520) {
          throw new Error('Server error (520)');
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let aiResponse = 'The AI encountered an error. Please try again.';

        if (data && data.length > 0 && data[0].Bundle && data[0].Bundle.length > 0) {
          const bundle = data[0].Bundle[0];
          if (bundle.Body) {
            aiResponse = bundle.Body;
          }
        }

        setMessages(prev => [...prev, { text: aiResponse, isUser: false }]);
      } catch (error) {
        let errorMessage = 'An unexpected error occurred. Please try again.';
        if (error instanceof Error) {
          if (error.message === 'Request timed out') {
            errorMessage = 'The AI is taking longer than expected to respond. Please try again.';
          } else if (error.message === 'Network response was not ok') {
            errorMessage = 'There was an issue connecting to the AI. Please check your internet connection and try again.';
          } else if (error.message === 'Server error (520)') {
            errorMessage = 'The server encountered an error (520). This might be due to high traffic or temporary issues. Please try again later.';
          } else if (error.message.startsWith('HTTP error!')) {
            errorMessage = `The server responded with an error: ${error.message}. Please try again later.`;
          }
        }
        setMessages(prev => [...prev, { text: errorMessage, isUser: false }]);
      } finally {
        setIsRaining(false);
        setIsWaiting(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-green-500 font-mono">
      <div className="flex-1 overflow-y-auto p-4 relative">
        {isRaining && <MatrixRain />}
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-green-500">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your message..."
            className="flex-1 bg-black text-green-500 border border-green-500 p-2 rounded-l focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={isWaiting}
            className="bg-green-500 text-black p-2 rounded-r hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50"
          >
            {isWaiting ? <Loader className="animate-spin" /> : <Send />}
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;