import { useState, useEffect, useRef } from 'react';
import { Message } from '../../types';
import { useAuthStore } from '../../store/authStore';
import MessageBubble from './MessageBubble';

const SEND_MESSAGE = `
  mutation SendMessage($jobId: ID!, $content: String!) {
    sendMessage(jobId: $jobId, content: $content) { id content createdAt sender { id name } senderId }
  }
`;

interface ChatWindowProps {
  jobId: string;
  initialMessages: Message[];
}

export default function ChatWindow({ jobId, initialMessages }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws?token=${token}&jobId=${jobId}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const event = JSON.parse(e.data);
      if (event.type === 'NEW_MESSAGE') setMessages((m) => [...m, event.payload]);
      if (event.type === 'TYPING') setTyping(true);
      if (event.type === 'TYPING_STOP') setTyping(false);
    };
    return () => ws.close();
  }, [jobId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const { accessToken } = useAuthStore.getState();
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ query: SEND_MESSAGE, variables: { jobId, content: text.trim() } }),
      });
      const json = await res.json();
      if (json.data?.sendMessage) setMessages((m) => [...m, json.data.sendMessage]);
      setText('');
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    else wsRef.current?.send(JSON.stringify({ type: 'TYPING', jobId }));
  };

  return (
    <div className="flex flex-col h-80 border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {messages.map((m) => <MessageBubble key={m.id} message={m} />)}
        {typing && <div className="text-xs text-gray-400 italic">typing…</div>}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-gray-200 flex items-center gap-2 p-3 bg-gray-50">
        <input
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campus-primary"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          className="bg-campus-primary text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
