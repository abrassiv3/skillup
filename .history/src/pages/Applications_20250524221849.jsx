import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link} from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Ensure this path is correct
import { userAuth } from '../context/AuthContext'; // Ensure this path is correct

const Applications = () => {
  const navigate = useNavigate();
  const { session } = userAuth(); // Get the current user session
  const [applications, setApplications] = useState([]);
  const { jobId } = useParams();
  const [loading, setLoading] = useState(true);

  // Effect to fetch applications when jobId changes or on initial load
  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  // Function to fetch applications from Supabase
  const fetchApplications = async () => {
    // Build the query to fetch applications
    let query = supabase
      .from('applications')
      .select('*, freelancerid(userid, firstname, lastname), projectid(project_id, title, accepting)')
      .eq('client_id', session.user.id); // Filter by the current client's ID

    // If a jobId is provided, filter applications for that specific project
    if (jobId) {
      query = query.eq('projectid', jobId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
    } else {
      // Format the fetched data, ensuring a default status if not present
      const formatted = data.map(app => ({
        ...app,
        status: app.status || 'PENDING',
      }));
      setApplications(formatted);
    }
    setLoading(false); // Set loading to false after data is fetched
  };

  // Realtime listener for Supabase changes to the 'applications' table
  useEffect(() => {
    const channel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'applications',
        },
        (payload) => {
          fetchApplications(); // Re-fetch applications on any change
        }
      )
      .subscribe(); // Subscribe to the channel

    // Cleanup function to unsubscribe when the component unmounts
    return () => {
      channel.unsubscribe();
    };
  }, [jobId]); // Re-run effect if jobId changes

  // Handler for approving an application
  const handleApprove = async (id) => {
    await supabase
      .from('applications')
      .update({ status: 'APPROVED'}) // Update status to APPROVED
      .eq('id', id); // Target the specific application by ID

    fetchApplications(); // Re-fetch applications to update UI
  };

  // Handler for rejecting an application
  const handleReject = async (id) => {
    await supabase
      .from('applications')
      .update({ status: 'DENIED' }) // Update status to DENIED
      .eq('id', id); // Target the specific application by ID
    fetchApplications(); // Re-fetch applications to update UI
  };

  // Handler for kicking off a project (linking freelancer to project)
  const handleKickOff = async (projectId, freelancerId) => {
    // Insert a new entry in 'freelancer-projects' to link them
    const { error: linkError } = await supabase
      .from('freelancer-projects')
      .insert([
        {
          client_id: session.user.id,
          projectid: projectId,
          freelancer_id: freelancerId
        }
      ]);

    // Update the project to no longer accept applications
    const { error } = await supabase
      .from('projects')
      .update({ accepting: false })
      .eq('project_id', projectId);

    if (error) {
      console.error('Error kicking off project:', error);
      return;
    }

    if (linkError) {
      console.error('Error linking freelancer to project:', linkError);
      return;
    }

    navigate('/dashboard'); // Navigate to dashboard after successful kick-off
  };

  // Handler for creating a chatroom
  const handleCreateChat = async (freelancerId, clientId) => {
    try {
      // Check if a chatroom already exists between these two users
      const { data: existingChatrooms, error: chatroomError } = await supabase
        .from('chatroom')
        .select('id')
        .or(`and(freelancer_id.eq.${freelancerId},client_id.eq.${clientId}),and(freelancer_id.eq.${clientId},client_id.eq.${freelancerId})`);

      if (chatroomError) {
        console.error('Error checking existing chatroom:', chatroomError);
        return;
      }

      if (existingChatrooms && existingChatrooms.length > 0) {
        // If a chatroom already exists, navigate to it
        navigate(`/chat/${existingChatrooms[0].id}`);
        return;
      }

      // If no existing chatroom, create a new one
      const { data, error } = await supabase
        .from('chatroom')
        .insert([
          {
            freelancer_id: freelancerId,
            client_id: clientId,
          }
        ])
        .select(); // Select the newly inserted row to get its ID

      if (error) {
        console.error('Error creating chatroom:', error);
        return;
      }

      if (data && data.length > 0) {
        navigate(`/chat/${data[0].id}`); // Navigate to the newly created chatroom
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error.message);
    }
  };

  // Helper function to determine CSS class for status display
  const getStatusClass = (status) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return 'text-green-500 border-green-500';
      case 'DENIED':
        return 'text-red-500 border-red-500';
      case 'PENDING':
      default:
        return 'text-yellow-500 border-yellow-500';
    }
  };

  // Display loading spinner while data is being fetched
  if (loading) {
    return (
      <div className='w-full p-2'>
        <h2 className="section-header text-2xl font-semibold">Applications</h2>
        <div className="flex items-center justify-center h-screen bg-gradient-to-b">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-xl font-medium text-neutral-200">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-4 p-2 gap-2">
        <h2 className="section-header text-2xl font-semibold">Applications</h2>
        {applications.length === 0 ? (
          <p>No applications available.</p>
        ) : (
          <ul className="columns-1 md:columns-2 gap-4">
            {applications.map(application => (
              <li className='break-inside-avoid py-3' key={application.id}>
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-neutral-700 text-white h-fit">
                  <div>
                    <p><strong>Project:</strong> {application.projectid.title}</p>
                    <p>
                      <strong>Applied on:</strong> {new Date(application.created_at).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                    <p><strong>Freelancer:</strong> {application.freelancerid.firstname} {application.freelancerid.lastname}</p>
                  </div>

                  <div>
                    <p><strong>Proposal:</strong></p>
                    <div dangerouslySetInnerHTML={{ __html: application.proposal.replace(/\n/g, '<br/>') }}></div>
                  </div>

                  <div>
                    {/* Fixed the template literal syntax here */}
                    <p className={`font-bold py-0.5 w-fit px-2 bg-neutral-800 border rounded-2xl ${getStatusClass(application.status)}`}>
                      <strong>Status:</strong> {application.status}
                    </p>
                  </div>

                  {application.projectid.accepting === true && (
                    <div className="flex gap-3 space-x-4 rounded-xl p-2 bg-neutral-800">
                      <button
                        className='w-full'
                        onClick={() => handleApprove(application.id)}
                        disabled={application.status === 'APPROVED'|| !application.projectid.accepting}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(application.id)}
                        disabled={application.status === 'DENIED' }
                        className="btn-sec w-full"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {application.status === 'APPROVED' && (
                    <div className="p-2 flex flex-col gap-1.5 text-center rounded-xl bg-neutral-800">
                      <p className="text-xl">
                        <strong>Kick-off project with {application.freelancerid.firstname}?</strong>
                      </p>
                      <button
                        onClick={() => handleKickOff(application.projectid.project_id, application.freelancerid.userid)}
                        hidden={application.projectid.accepting === false}
                      >
                        Start Project
                      </button>
                      {/* New Create Chat Button */}
                      <button
                        onClick={() => handleCreateChat(application.freelancerid.userid, session.user.id)}
                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                      >
                        Create Chat
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Applications;
