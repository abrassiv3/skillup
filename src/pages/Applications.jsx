import { useEffect, useState } from 'react';
import { useParams} from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const { jobId } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [jobId]);
  // Fetch initial data
  const fetchApplications = async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('id, created_at, status, proposal, freelancer_id(firstname, lastname), project_id(title)')
        .eq("project_id", jobId)
        .order('created_at', { ascending: true });

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

// Realtime listener
useEffect(() => {
  const channel = supabase
    .channel('applications-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // insert | update | delete
        schema: 'public',
        table: 'applications',
      },
      (payload) => {
        // Instead of trying to patch the state manually, just refetch
        fetchApplications();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [jobId]);  // always add jobId dependency to ensure it fetches for the correct project


  const handleApprove = async (id) => {
    await supabase.from('applications').update({ status: 'APPROVED' }).eq('id', id);
    fetchApplications();
  };

  const handleReject = async (id) => {
    await supabase.from('applications').update({ status: 'DENIED' }).eq('id', id);
    fetchApplications();
  };

  if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-b">
            <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-xl font-medium text-neutral-200">Loading...</p>
            </div>
            </div>
        );
    }

  return (
    <div>
      <div className="">
        <h2 className="section-header text-2xl font-semibold mb-4">Applications</h2>
        {applications.length === 0 ? (
          <p>No applications available.</p>
        ) : (
          <ul className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.map(application => (
              <li key={application.id}>
                <div className="border p-4 rounded-xl bg-neutral-700 text-white">
                  <p><strong>Project:</strong> {application.project_id.title}</p>
                  <p>
                     <strong>Sent on:</strong> {new Date(application.created_at).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>

                  <p><strong>Freelancer:</strong> {application.freelancer_id.firstname} {application.freelancer_id.lastname}</p>
                  <p><strong>Proposal:</strong></p>
                  <div dangerouslySetInnerHTML={{ __html: application.proposal.replace(/\n/g, '<br/>') }}></div>

                  <p className='border-t border-neutral-500 mt-2'><strong>Status:</strong> {application.status}</p>
                  <div className="flex space-x-4 mt-4">
                    <button
                      onClick={() => handleApprove(application.id)}
                      disabled={application.status === 'APPROVED'}
                      className={`px-4 py-2 rounded ${application.status === 'APPROVED' ? 'bg-gray-400' : 'bg-green-500 text-white'}`}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(application.id)}
                      disabled={application.status === 'DENIED'}
                      className={`btn-sec px-4 py-2 rounded ${application.status === 'DENIED' ? 'bg-gray-400' : 'bg-red-500 text-white'}`}
                    >
                      Reject
                    </button>
                  </div>
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
