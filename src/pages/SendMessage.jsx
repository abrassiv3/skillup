import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function SendMessage({ chatroomId }) {
  const [message, setMessage] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const { error } = await supabase.from('chat').insert([
      {
        chatroom_id: chatroomId,
        message: message,
        sender_id: '953d2516-6b56-417a-b3c7-df1ca9e9fa59', // You can make this dynamic if you have auth
      },
    ]);

    if (error) console.error('Error sending message:', error);
    else setMessage('');
  };

  return (
    <form onSubmit={handleSend} className="flex">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
        className="flex-1 border rounded p-2"
      />
      <button type="submit" className="ml-2 bg-blue-500 text-white rounded p-2">
        Send
      </button>
    </form>
  );
}
