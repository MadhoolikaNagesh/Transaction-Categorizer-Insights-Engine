import { Component, Output, EventEmitter, OnInit, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { lastValueFrom } from 'rxjs';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  html?: string;
}

@Component({
  selector: 'app-chat-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-assistant.component.html'
})
export class ChatAssistantComponent implements OnInit, AfterViewChecked {
  @Output() closeChat = new EventEmitter<void>();
  @ViewChild('messagesEnd') messagesEndRef!: ElementRef;

  messages = signal<ChatMessage[]>([]);
  input = signal('');
  isLoading = signal(false);
  private shouldScroll = false;

  quickPrompts = [
    "Do I have any duplicate charges?",
    "Show me transactions over ₹5000",
    "Categorize Swiggy to Dining",
    "Analyze my weekend spending"
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    const initTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const welcomeText = "Hello! I am **FinVertex**. I can search, analyze, and monitor your transactions.\n\nAsk me questions like:\n* *'Show me all transactions over ₹5000 last week.'*\n* *'Do I have any duplicate charges?'*\n* *'Tell me what I spent on dining this month.'*";
    this.messages.set([{
      sender: 'assistant',
      text: welcomeText,
      time: initTime,
      html: this.renderMarkdown(welcomeText)
    }]);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  scrollToBottom(): void {
    if (this.messagesEndRef?.nativeElement) {
      this.messagesEndRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  setInput(value: string): void { this.input.set(value); }

  handleQuickPrompt(prompt: string): void { this.input.set(prompt); }

  async handleSend(e?: Event): Promise<void> {
    if (e) e.preventDefault();
    if (!this.input().trim() || this.isLoading()) return;

    const userText = this.input();
    this.input.set('');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.messages.update(msgs => [...msgs, { sender: 'user', text: userText, time, html: this.escapeHtml(userText) }]);
    this.isLoading.set(true);
    this.shouldScroll = true;

    try {
      const res = await lastValueFrom(this.api.sendChatMessage(userText));
      const responseText = res.response || "I couldn't process that query.";
      this.messages.update(msgs => [...msgs, {
        sender: 'assistant',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        html: this.renderMarkdown(responseText)
      }]);
    } catch (err: any) {
      const errMsg = `⚠️ **Error connecting to AI Server:** ${err.message}. Make sure your backend application is running and your OpenAI API key is configured.`;
      this.messages.update(msgs => [...msgs, {
        sender: 'assistant',
        text: errMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        html: this.renderMarkdown(errMsg)
      }]);
    } finally {
      this.isLoading.set(false);
      this.shouldScroll = true;
    }
  }

  escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  renderMarkdown(text: string): string {
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    const lines = html.split('\n');
    let inTable = false;
    let tableHtml = '';
    const outputLines: string[] = [];

    for (const line of lines) {
      const l = line.trim();
      if (l.startsWith('|') && l.endsWith('|')) {
        if (!inTable) { inTable = true; tableHtml = '<table>'; }
        if (l.includes('---') || l.includes('-:-')) continue;
        const cells = l.split('|').slice(1, -1).map(c => c.trim());
        const isHeader = !tableHtml.includes('<tbody>') && !tableHtml.includes('<thead>');
        if (isHeader) {
          tableHtml += '<thead><tr>' + cells.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
        } else {
          tableHtml += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
        }
      } else {
        if (inTable) { inTable = false; tableHtml += '</tbody></table>'; outputLines.push(tableHtml); tableHtml = ''; }
        if (l.startsWith('* ') || l.startsWith('- ')) outputLines.push(`<li>${l.substring(2)}</li>`);
        else if (l.startsWith('### ')) outputLines.push(`<h3>${l.substring(4)}</h3>`);
        else if (l.startsWith('## ')) outputLines.push(`<h2>${l.substring(3)}</h2>`);
        else if (l.startsWith('# ')) outputLines.push(`<h1>${l.substring(2)}</h1>`);
        else if (l) outputLines.push(`<p>${l}</p>`);
      }
    }
    if (inTable) { tableHtml += '</tbody></table>'; outputLines.push(tableHtml); }

    let finalHtml = '';
    let inList = false;
    for (const item of outputLines) {
      if (item.startsWith('<li>')) {
        if (!inList) { inList = true; finalHtml += '<ul>'; }
        finalHtml += item;
      } else {
        if (inList) { inList = false; finalHtml += '</ul>'; }
        finalHtml += item;
      }
    }
    if (inList) finalHtml += '</ul>';
    return finalHtml;
  }
}
