import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "Hello! I am **Antigravity Finance AI**. I can search, analyze, and monitor your transactions.\n\nAsk me questions like:\n* *'Show me all transactions over ₹5000 last week.'*\n* *'Do I have any duplicate charges?'*\n* *'Tell me what I spent on dining this month.'*",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { sender: 'user', text: userText, time }]);
    setIsLoading(true);

    try {
      const responseText = await apiService.sendChatMessage(userText);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: responseText || "I couldn't process that query.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `⚠️ **Error connecting to AI Server:** ${err.message}. Make sure your backend application is running and your OpenAI API key is configured.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
  };

  // Basic custom markdown parser for chatbot bubbles
  const renderMessageContent = (text: string) => {
    // Escape simple HTML
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold tags
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic tags
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Handle Tables
    const lines = html.split('\n');
    let inTable = false;
    let tableHtml = '';
    const outputLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Is it a table row?
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableHtml = '<table>';
        }
        
        // Skip separator line |---|---|
        if (line.includes('---') || line.includes('-:-')) {
          continue;
        }

        const cells = line.split('|').slice(1, -1).map(c => c.trim());
        const isHeader = !tableHtml.includes('<tbody>') && !tableHtml.includes('<thead>');
        
        if (isHeader) {
          tableHtml += '<thead><tr>' + cells.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
        } else {
          tableHtml += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
        }
      } else {
        if (inTable) {
          inTable = false;
          tableHtml += '</tbody></table>';
          outputLines.push(tableHtml);
          tableHtml = '';
        }
        
        // Bullet list item
        if (line.startsWith('* ') || line.startsWith('- ')) {
          outputLines.push(`<li>${line.substring(2)}</li>`);
        } else if (line.startsWith('### ')) {
          outputLines.push(`<h3>${line.substring(4)}</h3>`);
        } else if (line.startsWith('## ')) {
          outputLines.push(`<h2>${line.substring(3)}</h2>`);
        } else if (line.startsWith('# ')) {
          outputLines.push(`<h1>${line.substring(2)}</h1>`);
        } else if (line) {
          outputLines.push(`<p>${line}</p>`);
        }
      }
    }

    if (inTable) {
      tableHtml += '</tbody></table>';
      outputLines.push(tableHtml);
    }

    // Wrap continuous li tags in a ul
    let finalHtml = '';
    let inList = false;
    
    for (const item of outputLines) {
      if (item.startsWith('<li>')) {
        if (!inList) {
          inList = true;
          finalHtml += '<ul>';
        }
        finalHtml += item;
      } else {
        if (inList) {
          inList = false;
          finalHtml += '</ul>';
        }
        finalHtml += item;
      }
    }
    if (inList) {
      finalHtml += '</ul>';
    }

    return <div dangerouslySetInnerHTML={{ __html: finalHtml }} />;
  };

  const quickPrompts = [
    "Do I have any duplicate charges?",
    "Show me transactions over ₹5000",
    "Categorize Swiggy to Dining",
    "Analyze my weekend spending"
  ];

  return (
    <div className="chat-widget">
      <div className="chat-header">
        <div className="chat-header-status"></div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Antigravity Finance AI <Sparkles size={13} style={{ color: 'var(--color-accent)' }} />
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Spring AI Function Calling Agent</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            <div className="message-bubble">
              {renderMessageContent(msg.text)}
            </div>
            <span className="message-time">{msg.time}</span>
          </div>
        ))}
        {isLoading && (
          <div className="chat-message assistant">
            <div className="message-bubble" style={{ padding: '0.5rem' }}>
              <div className="ai-typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '0.5rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', borderTop: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.15)' }}>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPrompt(p)}
            className="filter-input"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', cursor: 'pointer', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {p}
          </button>
        ))}
      </div>

      <form onSubmit={handleSend} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI (e.g. 'what did I spend on cafes last week?')..."
          className="chat-input"
          disabled={isLoading}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }} disabled={isLoading}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
