import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  // Fetch initial data
  const fetchApplications = async () => {
      const { data: { user }, 
              error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
        console.error("User not found:", userError);
        return <p>User not found</p>;
        }

      const { data, error } = await supabase
        .from('applications')
        .select('*, client_id(firstname, lastname), projectid(title)')
        .eq("freelancerid", user.id)
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
    channel.unsubscribe();
  };
}, []);

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
          <div className='w-full pb-8'>
            <h2 className="section-header">Applications</h2>
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
      <div className="w-full pb-8">
        <h2 className="section-header">Applications</h2>
        {applications.length === 0 ? (
          <p>No applications available.</p>
        ) : (
          <ul className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.map(application => (
              <li key={application.id}>
                <div className=" p-4 rounded-xl bg-neutral-700 text-white">
                  
                  <div className='border-b-2 border-neutral-500 pb-2'>
                    <p className={`font-bold py-0.5 w-fit px-2 m-0.5 bg-neutral-800 border rounded-2xl ${getStatusClass(application.status)}`}>
                    <strong>Status:</strong> {application.status}
                  </p>
                  </div>
                  

                  <p><strong>Project:</strong> {application.projectid.title}</p>
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

                  <p><strong>Client:</strong> {application.client_id.firstname} {application.client_id.lastname}</p>
                  <p><strong>Proposal:</strong></p>
                  <div className='py-2' dangerouslySetInnerHTML={{ __html: application.proposal.replace(/\n/g, '<br/>') }}></div>
                  
                  

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
