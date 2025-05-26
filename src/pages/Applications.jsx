import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link} from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { userAuth } from '../context/AuthContext';

const Applications = () => {
  const navigate = useNavigate();
  const { session } = userAuth();
  const [applications, setApplications] = useState([]);
  const { jobId } = useParams();
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    fetchApplications();
  }, [jobId]);

    const fetchApplications = async () => {
      let query = supabase
      .from('applications')
      .select('*, freelancerid(userid, firstname, lastname), projectid(project_id, title, accepting)')
      .eq('client_id', session.user.id);

    if (jobId) {
      query = query.eq('projectid', jobId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
    } else {
      const formatted = data.map(app => ({
        ...app,
        status: app.status || 'PENDING',
      }));
      setApplications(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    const channel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
        },
        (payload) => {
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [jobId]);

  const handleApprove = async (id) => {
    await supabase
      .from('applications')
      .update({ status: 'APPROVED'})
      .eq('id', id); 

    fetchApplications();
  };

  const handleReject = async (id) => {
    await supabase
      .from('applications')
      .update({ status: 'DENIED' })
      .eq('id', id); 
    fetchApplications();
  };

  const handleKickOff = async (projectId, freelancerId) => {
    const { error: linkError } = await supabase
      .from('freelancer-projects')
      .insert([
        {
          client_id: session.user.id,
          projectid: projectId,
          freelancer_id: freelancerId
        }
      ]);

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

    navigate('/dashboard');
  };

  const handleCreateChat = async (freelancerId, clientId) => {
    try {
      const { data: existingChatrooms, error: chatroomError } = await supabase
        .from('chatroom')
        .select('id')
        .or(`and(freelancer_id.eq.${freelancerId},client_id.eq.${clientId}),and(freelancer_id.eq.${clientId},client_id.eq.${freelancerId})`);

      if (chatroomError) {
        console.error('Error checking existing chatroom:', chatroomError);
        return;
      }

      if (existingChatrooms && existingChatrooms.length > 0) {
        navigate(`/chats/${existingChatrooms[0].id}`);
        return;
      }

      const { data, error } = await supabase
        .from('chatroom')
        .insert([
          {
            freelancer_id: freelancerId,
            client_id: clientId,
          }
        ])
        .select();

      if (error) {
        console.error('Error creating chatroom:', error);
        return;
      }

      if (data && data.length > 0) {
        navigate(`/client-chats/${data[0].id}`); 
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error.message);
    }
  };

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
                        <strong>
                          {application.projectid.accepting === false
                            ? 'Project Started'
                            : `Kick-off project with ${application.freelancerid.firstname}?`}
                        </strong>
                      </p>

                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleKickOff(application.projectid.project_id, application.freelancerid.userid)}
                          hidden={application.projectid.accepting === false}
                          className='w-full'
                        >
                          Start Project
                        </button>

                        <button
                          onClick={() => handleCreateChat(application.freelancerid.userid, session.user.id)}
                          className='w-full btn-ter'
                        > Chat
                        </button>
                        </div>
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
