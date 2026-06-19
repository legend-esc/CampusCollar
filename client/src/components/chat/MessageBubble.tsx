import { Message } from '../../types';
import { useAuthStore } from '../../store/authStore';

export default function MessageBubble({ message }: { message: Message }) {
  const userId = useAuthStore((s) => s.user?.id);
  const isOwn = message.senderId === userId;
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isOwn ? 'bg-campus-primary text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}
      >
        {!isOwn && <p className="text-xs font-semibold mb-0.5 opacity-70">{message.sender.name}</p>}
        <p>{message.content}</p>
        <p className={`text-xs mt-0.5 ${isOwn ? 'opacity-60' : 'text-gray-400'}`}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
