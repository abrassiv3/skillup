import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SendMessage from '../pages/SendMessage';

export default function Messages({ chatroomId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`chat-${chatroomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat', filter: `chatroom_id=eq.'${chatroomId}'` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    // Clean up subscription on unmount or chatroom change
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [chatroomId]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat')
      .select('*', 'sender_id(usertype)')
      .eq('chatroom_id', '1d397604-e7ca-46f0-ada4-f2e9dfe7963f')
      .order('sent_at', { ascending: true });
        
    if (error) console.error('Error fetching messages:', error);
    else setMessages(data);
  }

//FIXMESSAGES

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4 border p-2 rounded">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className="mb-2">
              <strong>{msg.sender_id.usertype}:</strong> {msg.message}
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </div>
      <SendMessage chatroomId={chatroomId} />
    </div>
  );
}
