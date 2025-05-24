import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Ensure this path is correct
import { userAuth } from '../context/AuthContext'; // Ensure this path is correct
import { Link } from 'react-router-dom'; // Import Link for navigation

const FlClientsChats = () => {
  const { session } = userAuth(); // Get the current user session
  const [chatrooms, setChatrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch chatrooms for the current user
    const fetchChatrooms = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        setError("User not logged in.");
        return;
      }

      try {
        // Fetch chatrooms where the current user is either the client_id or the freelancer_id
        const { data, error: fetchError } = await supabase
          .from('chatroom')
          .select(`
            id,
            freelancer_id,
            client_id,
            freelancer:freelancer_id(userid, firstname, lastname),
            client:client_id(userid, firstname, lastname)
          `)
          .or(`freelancer_id.eq.${session.user.id},client_id.eq.${session.user.id}`);

        if (fetchError) {
          console.error('Error fetching chatrooms:', fetchError);
          setError(fetchError.message);
        } else {
          setChatrooms(data);
        }
      } catch (err) {
        console.error('An unexpected error occurred while fetching chatrooms:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChatrooms();

    // Realtime listener for Supabase changes to the 'chatroom' table
    const channel = supabase
      .channel('chatroom-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'chatroom',
        },
        (payload) => {
          // Re-fetch chatrooms on any change to keep the list updated
          fetchChatrooms();
        }
      )
      .subscribe(); // Subscribe to the channel

    // Cleanup function to unsubscribe when the component unmounts
    return () => {
      channel.unsubscribe();
    };

  }, [session]); // Re-run effect if session changes

  // Display loading spinner while data is being fetched
  if (loading) {
    return (
      <div className='w-full p-2'>
        <h2 className="section-header text-2xl font-semibold">Your Chats</h2>
        <div className="flex items-center justify-center h-screen bg-gradient-to-b">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-xl font-medium text-neutral-200">Loading chats...</p>
          </div>
        </div>
      </div>
    );
  }

  // Display error message if fetching failed
  if (error) {
    return (
      <div className='w-full p-2 text-red-500'>
        <h2 className="section-header text-2xl font-semibold">Your Chats</h2>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6 text-neutral-800">Your Chats</h2>
      {chatrooms.length === 0 ? (
        <p className="text-neutral-600">You don't have any active chatrooms yet.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chatrooms.map((chatroom) => {
            // Determine the other participant's name
            const otherParticipant = chatroom.freelancer_id === session.user.id
              ? chatroom.client // Current user is freelancer, other is client
              : chatroom.freelancer; // Current user is client, other is freelancer

            const participantName = otherParticipant
              ? `${otherParticipant.firstname} ${otherParticipant.lastname}`
              : 'Unknown User'; // Fallback if name is not available

            return (
              <li key={chatroom.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                <Link to={`/chat/${chatroom.id}`} className="block">
                  <h3 className="text-xl font-semibold text-blue-600 mb-2">Chat with {participantName}</h3>
                  <p className="text-neutral-600">Chat ID: {chatroom.id}</p>
                  {/* You can add more chatroom details here if available, e.g., last message, unread count */}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FlClientsChats;
