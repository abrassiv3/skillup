import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { userAuth } from '../context/AuthContext';

const Chat = () => {
  const { chatid } = useParams(); 
  const { session } = userAuth(); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null); 

  const currentUserId = session?.user?.id;

  const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

function linkify(text) {
const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">${url}</a>`;
  });
}

  useEffect(() => {
    if (!currentUserId || !chatid) {
      setLoading(false);
      setError("User not logged in or chatroom ID is missing.");
      return;
    }

  const fetchMessages = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            sender_id,
            sender:sender_id(userid, firstname, lastname)
          `)
          .eq('chatroom_id', chatid)
          .order('created_at', { ascending: true });

        if (fetchError) {
          console.error('Error fetching messages:', fetchError);
          setError(fetchError.message);
        } else {
          setMessages(data);
        }
      } catch (err) {
        console.error('An unexpected error occurred while fetching messages:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`chatroom-${chatid}-messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chatroom_id=eq.${chatid}` 
        },
        (payload) => {
          const newMessageData = payload.new;

          const getSenderDetails = async () => {
            const { data: senderData, error: senderError } = await supabase
              .from('users')
              .select('userid, firstname, lastname')
              .eq('userid', newMessageData.sender_id)
              .single();

            if (senderError) {
              console.error('Error fetching sender details for new message:', senderError);
              return { userid: newMessageData.sender_id, firstname: 'Unknown', lastname: 'User' };
            }
            return senderData;
          };

          getSenderDetails().then(sender => {
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                ...newMessageData,
                sender: sender 
              }
            ]);
          });
        }
      )
      .subscribe(); 

    return () => {
      channel.unsubscribe();
    };
  }, [chatid, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      const { error: insertError } = await supabase
        .from('messages')
        .insert([
          {
            chatroom_id: chatid,
            sender_id: currentUserId,
            content: newMessage.trim(),
          }
        ]);

      if (insertError) {
        console.error('Error sending message:', insertError);
        setError(insertError.message);
      } else {
        setNewMessage('');
      }
    } catch (err) {
      console.error('An unexpected error occurred while sending message:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className='w-full p-2'>
        <h2 className="section-header text-2xl font-semibold">Chat</h2>
        <div className="flex items-center justify-center h-screen bg-gradient-to-b">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-xl font-medium text-neutral-200">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full p-2 text-red-500'>
        <h2 className="section-header text-2xl font-semibold">Chat Error</h2>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col py-4 h-screen gap-1">
      <h2 className="section-header">Chat</h2>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-900 rounded-lg">
        {messages.length === 0 ? (
          <p className="text-center text-neutral-600">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md
                  ${message.sender_id === currentUserId
                    ? 'bg-green-900 text-white rounded-br-none'
                    : 'bg-neutral-200 text-neutral-800 rounded-bl-none'
                  }`}
              >
                <div className="flex gap-4 items-baseline justify-between font-semibold text-sm h-fit">
                  {message.sender_id === currentUserId ? 'You' : `${message.sender?.firstname || 'Unknown'}`}
                  <p className="text-xs pt-1 opacity-75">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div
                  className="break-words"
                  dangerouslySetInnerHTML={{ __html: linkify(message.content) }}
                />
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-neutral-800 shadow-lg flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
