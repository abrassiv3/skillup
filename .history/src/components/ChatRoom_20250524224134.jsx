import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Ensure this path is correct
import { userAuth } from '../context/AuthContext'; // Ensure this path is correct

const ChatRoom = () => {
  const { chatid } = useParams(); // Get the chatroom ID from the URL parameters
  const { session } = userAuth(); // Get the current user session
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null); // Ref for auto-scrolling to the latest message

  const currentUserId = session?.user?.id;

  // Function to scroll to the bottom of the messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect to fetch messages and set up real-time listener
  useEffect(() => {
    if (!currentUserId || !chatid) {
      setLoading(false);
      setError("User not logged in or chatroom ID is missing.");
      return;
    }

    // Function to fetch messages for the current chatroom
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
          .eq('chatroom_id', chatid) // Filter messages by the current chatroom ID
          .order('created_at', { ascending: true }); // Order messages by time

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

    // Set up real-time listener for new messages in this chatroom
    const channel = supabase
      .channel(`chatroom-${chatid}-messages`) // Unique channel name for this chatroom
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Listen only for new message insertions
          schema: 'public',
          table: 'messages',
          filter: `chatroom_id=eq.${chatid}` // Filter changes to this specific chatroom
        },
        (payload) => {
          // Add the new message to the state
          // Supabase real-time payload for INSERT contains the new row in payload.new
          const newMessageData = payload.new;

          // Fetch sender details if not already available in payload (Supabase real-time doesn't include joins directly)
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
                sender: sender // Attach sender details
              }
            ]);
          });
        }
      )
      .subscribe(); // Subscribe to the channel

    // Cleanup function to unsubscribe when the component unmounts or chatid changes
    return () => {
      channel.unsubscribe();
    };

  }, [chatid, currentUserId]); // Re-run effect if chatid or currentUserId changes

  // Effect to scroll to bottom whenever messages array updates
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handler for sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!newMessage.trim()) return; // Don't send empty messages

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
        setNewMessage(''); // Clear the input field after sending
      }
    } catch (err) {
      console.error('An unexpected error occurred while sending message:', err);
      setError(err.message);
    }
  };

  // Display loading spinner
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

  // Display error message
  if (error) {
    return (
      <div className='w-full p-2 text-red-500'>
        <h2 className="section-header text-2xl font-semibold">Chat Error</h2>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-100">
      <h2 className="text-3xl font-bold p-4 bg-white shadow-md text-neutral-800">Chatroom: {chatid}</h2>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-300 text-neutral-800 rounded-bl-none'
                  }`}
              >
                <div className="font-semibold text-sm mb-1">
                  {message.sender_id === currentUserId ? 'You' : `${message.sender?.firstname || 'Unknown'} ${message.sender?.lastname || ''}`}
                </div>
                <p className="break-words">{message.content}</p>
                <div className="text-xs mt-1 opacity-75">
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} /> {/* Empty div to scroll to */}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white shadow-lg flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
