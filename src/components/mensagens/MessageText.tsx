
import React from 'react';
import { renderTextWithMentions } from '@/utils/mentionUtils';

interface MessageTextProps {
  children: string;
  className?: string;
}

const MessageText: React.FC<MessageTextProps> = ({ children, className = "" }) => {
  const renderedContent = renderTextWithMentions(children);
  
  return (
    <div className={className}>
      {renderedContent}
    </div>
  );
};

export default MessageText;
