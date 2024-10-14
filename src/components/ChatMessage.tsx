import React from 'react';

interface ChatMessageProps {
  message: {
    text: string;
    isUser: boolean;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] p-2 rounded-lg text-sm ${
          message.isUser
            ? 'bg-green-700 text-black'
            : 'bg-green-900 text-green-300'
        }`}
      >
        <p>{message.text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;