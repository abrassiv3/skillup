import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';
import Messages from './Messages';

export default function ChatRooms() {
  const [chatrooms, setChatrooms] = useState([]);
  const [selectedChatroom, setSelectedChatroom] = useState(null);

  useEffect(() => {
    fetchChatrooms();
  }, []);

  const fetchChatrooms = async () => {
    const { data, error } = await supabase.from('chatrooms').select('*');
    if (error) console.error('Error fetching chatrooms:', error);
    else setChatrooms(data);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar with chatrooms */}
      <div className="w-1/4 border-r p-2">
        <h2 className="text-lg font-bold mb-2">Chatrooms</h2>
        {chatrooms.map((chatroom) => (
          <div
            key={chatroom.id}
            className={`cursor-pointer hover:bg-gray-200 p-2 rounded ${selectedChatroom === chatroom.id ? 'bg-gray-300' : ''}`}
            onClick={() => setSelectedChatroom(chatroom.id)}
          >
            {chatroom.name}
          </div>
        ))}
      </div>

      {/* Messages for selected chatroom */}
      <div className="w-3/4 p-2">
        {selectedChatroom ? (
          <Messages chatroomId={selectedChatroom} />
        ) : (
          <p>Select a chatroom to see messages.</p>
        )}
      </div>
    </div>
  );
}
