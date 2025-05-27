import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { userAuth } from "../context/AuthContext";

const ChatroomList = () => {
  const { session } = userAuth();
  const [chatrooms, setChatrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const navigate = useNavigate();

  const fetchUserRole = async (userId) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("users")
      .select("usertype")
      .eq("userid", userId)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
    } else {
      setUserRole(data.usertype);
    }
  };

  useEffect(() => {
    const fetchChatrooms = async () => {
      if (!session?.user?.id) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("chatroom")
          .select(`
            *,
            freelancer:freelancer_id(userid, firstname, lastname),
            client:client_id(userid, firstname, lastname)
          `)
          .or(`freelancer_id.eq.${session.user.id},client_id.eq.${session.user.id}`);

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setChatrooms(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };



    if (session?.user?.id) {
      fetchUserRole(session.user.id);
      fetchChatrooms();

      const channel = supabase
        .channel("chatroom-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "chatroom",
          },
          () => {
            fetchChatrooms();
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [session]);

  if (loading) return <p>Loading chatrooms...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-2 border-2 border-neutral-600 rounded-2xl">
     {chatrooms.length === 0 ? (
        <p className="text-2xl">You don't have any active chatrooms yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4">        
      {chatrooms.map((chatroom) => {
        const participant =
          session.user.id === chatroom.freelancer?.userid
            ? chatroom.client
            : chatroom.freelancer;

        const participantName = participant
          ? `${participant.firstname} ${participant.lastname}`
          : "Unknown";

        return (
          
          <li className="bg-neutral-800 rounded-lg  hover:shadow-lg transition-shadow duration-300">
          <button className="btn-ter w-full" onClick={() => navigate(userRole === "Freelancer"
                ? `/flchats/${chatroom.id}`
                : `/chats/${chatroom.id}`)}>{participantName}</button>
         </li>
        );
      })}
     </ul>
        )}
    </div>
  );  
};

export default ChatroomList;
