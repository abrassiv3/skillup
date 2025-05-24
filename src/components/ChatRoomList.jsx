// import { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";
// import { userAuth } from '../context/AuthContext'
// import { Link } from "react-router-dom";

// const ChatroomList = () => {
//   const { session } = userAuth();
//   const [chatrooms, setChatrooms] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [userRole, setUserRole] = useState(null);

//   const fetchUserRole = async (userId) => {
//     if (!userId) return;
//     const { data, error } = await supabase
//       .from("users")
//       .select("usertype")
//       .eq("userid", userId)
//       .single();

//     if (error) {
//       console.error("Error fetching user role:", error);
//     } else {
//       setUserRole(data.usertype);
//     }
//   };

//   useEffect(() => {
//     const fetchChatrooms = async () => {
//       if (!session?.user?.id) {
//         setLoading(false);
//         setError("User not logged in.");
//         return;
//       }

//       try {
//         const { data, error: fetchError } = await supabase
//           .from('chatroom')
//           .select(`
//             *,
//             freelancer:freelancer_id(userid, firstname, lastname),
//             client:client_id(userid, firstname, lastname)
//           `)
//           .or(`freelancer_id.eq.${session.user.id},client_id.eq.${session.user.id}`);


//         if (fetchError) {
//           setError(fetchError.message);
//         } else {
//           setChatrooms(data);
//           fetchUserRole();
//         }
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChatrooms();

//     const channel = supabase
//       .channel('chatroom-changes')
//       .on(
//         'postgres_changes',
//         {
//           event: '*',
//           schema: 'public',
//           table: 'chatroom',
//         },
//         () => {
//           fetchChatrooms();
//         }
//       )
//       .subscribe();

//     return () => {
//       channel.unsubscribe();
//     };
//   }, [session]);

//   if (loading) {
//     return (
//       <div className='w-full p-2'>
//         <h2 className="section-header text-2xl font-semibold">Your Chats</h2>
//         <div className="flex items-center justify-center h-screen bg-gradient-to-b">
//           <div className="flex flex-col items-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
//             <p className="mt-4 text-xl font-medium text-neutral-200">Loading chats...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className='w-full p-2 text-red-500'>
//         <h2 className="section-header text-2xl font-semibold">Your Chats</h2>
//         <p>Error: {error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-2">
//       <h2 className="section-header">Your Chats</h2>
//       {chatrooms.length === 0 ? (
//         <p className="text-2xl">You don't have any active chatrooms yet.</p>
//       ) : (
//         <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {chatrooms.map((chatroom) => {
//             const otherParticipant = chatroom.freelancer_id === session.user.id
//               ? chatroom.client
//               : chatroom.freelancer;

//             const participantName = otherParticipant
//               ? `${otherParticipant.firstname} ${otherParticipant.lastname}`
//               : 'Unknown User';

//             return (
//               <li key={chatroom.id} className="bg-neutral-700 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
//                 <Link 
//                   to={userRole === 'Freelancer' 
//                         ? `/flchats/${chatroom.id}` 
//                         : `/chats/${chatroom.id}`} 
//                   className="block"
//                 >
//                   <h3 className="header">{participantName}</h3>
//                 </Link>
//               </li>
//             );
//           })}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default ChatroomList;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { userAuth } from "../context/AuthContext";

const ChatroomList = () => {
  const { session } = userAuth();
  const [chatrooms, setChatrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Fetch user role (Freelancer or Client)
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

  // Fetch chatrooms and user role
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
    <div className="p-2">
     <h2 className="section-header">Your Chats</h2>
     {chatrooms.length === 0 ? (
        <p className="text-2xl">You don't have any active chatrooms yet.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">        
      {chatrooms.map((chatroom) => {
        const participant =
          session.user.id === chatroom.freelancer?.userid
            ? chatroom.client
            : chatroom.freelancer;

        const participantName = participant
          ? `${participant.firstname} ${participant.lastname}`
          : "Unknown";

        return (
          <li className="bg-neutral-700 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
          <Link
            key={chatroom.id}
            to={
              userRole === "Freelancer"
                ? `/flchats/${chatroom.id}`
                : `/chats/${chatroom.id}`
            }
            className="block"
          >
            <h3 className="header">{participantName}</h3>
          </Link>
         </li>
        );
      })}
     </ul>
        )}
    </div>
  );  
};

export default ChatroomList;
