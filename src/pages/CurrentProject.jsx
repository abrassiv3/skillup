import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const CurrentProject = () => {
  const navigate =useNavigate()
  const { id } = useParams();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch milestones for the given project
  useEffect(() => {
    if (id) {
      fetchMilestones();
    }
  }, [id]);

  const fetchMilestones = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('milestones')
      .select('*, projectid(project_id, title, status), completed')
      .eq('projectid', id)

    if (error) {
      console.error('Error fetching milestones:', error);
    } else {
      setMilestones(data);
    }
    setLoading(false);
  };

  // Realtime listener
useEffect(() => {
  const channel = supabase
    .channel('realtime-changes') // use a common channel name
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'milestones',
      },
      (payload) => {
        fetchMilestones();
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
      },
      (payload) => {
        fetchMilestones();
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe(); // Proper cleanup
  };
}, [id]);


  const handleApprove = async (id) => {
    await supabase
      .from('milestones')
      .update({ approved: 'APPROVED', completed: true })
      .eq('id', id);

    fetchMilestones();
  };

  const handleReject = async (id) => {
    await supabase
      .from('milestones')
      .update({ approved: 'DENIED', completed: false })
      .eq('id', id);
    fetchMilestones();
  };

  const allMilestonesCompleted = milestones.length > 0 && milestones.every((milestone) => milestone.completed && milestone.approved === 'APPROVED');

  const handleMarkProjectCompleted = async (id) => {
    const { error } = await supabase
      .from('projects')
      .update({ status: 'COMPLETED' })
      .eq('project_id', id);

    if (error) {
      console.error('Error marking project as completed:', error);
    } else {
      alert('Project marked as completed!');
    }
};

  const handleMarkProjectIncompleted = async (id ) => {
    const { error } = await supabase
      .from('projects')
      .update({ status: 'ONGOING' })
      .eq('project_id', id);

    if (error) {
      console.error('Error marking project as completed:', error);
      } else {
        alert('Project marked as incompleted!');
      }
  };


  const getApprovalClass = (status) => {
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
            <h2 className="section-header text-2xl font-semibold">Milestones</h2>
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
    <div className="w-full p-2">
      <h2 className="section-header text-2xl font-semibold">Milestones</h2>
       <p>Project: {milestones.length > 0 ? milestones[0].projectid.title : 'Milestones'}</p> 
       <p className='font-bold py-0.5 w-fit px-2 bg-neutral-800 border rounded-2xl text-blue-400'>Status: {milestones[0].projectid.status}</p> 
      {milestones.length === 0 ? (
        <div className='flex flex-col  gap-4 items-center'>
          <p className='text-3xl'><strong>No milestones found for this project.</strong></p>
          <button onClick={() => navigate('/dashboard')}>Back to Active Posts</button>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {milestones.map((milestone) => (
            <li key={milestone.id} className="flex justify-around border-2 border-neutral-700 py-2 px-4 gap-5 rounded-lg bg-neutral-800 text-white">
              
              <div className='flex w-full gap-2 items-center'>
                <h3 className="text-xl font-semibold">{milestone.milestone}</h3>
                <p className={`font-bold py-0.5 w-fit px-2 bg-neutral-800 border rounded-2xl ${getApprovalClass(milestone.approved)}`}>{milestone.approved}</p>
              </div>
              
              <div className="flex items-center gap-3 w-full">
                {milestone.fileURL && (
                <p className="mt-2">
                  <a href={milestone.fileURL} target="_blank" rel="noopener noreferrer" className="text-sky-500 underline">
                    View Uploaded File
                  </a>
                </p>
                )}
              </div> 

              <div className="flex w-fit items-center gap-2">
              <button 
                className='h-fit'
                disabled={milestone.approved === 'APPROVED'}
                onClick={() => handleApprove(milestone.id)}>Approve</button>
              <button
                disabled={milestone.approved === 'DENIED'}
                className='btn-sec h-fit' 
                onClick={() => handleReject(milestone.id)}>Reject</button>
              </div>         
            </li>
          ))}
        </ul>
      )}

      {allMilestonesCompleted && (
        <div className="flex flex-row items-center justify-center py-4 gap-4">
          <button
            className="w-fit"
            onClick={() => handleMarkProjectCompleted(milestones[0].projectid.project_id)}
            disabled={milestones[0].projectid.status === 'COMPLETED'}
          >
            Mark Project as Completed
          </button>
          <button
            className="btn-sec"
            onClick={() => handleMarkProjectIncompleted(milestones[0].projectid.project_id)}
            disabled={milestones[0].projectid.status === 'ONGOING'}
          >
            Mark Project as Incompleted
          </button>
        </div>
      )}

    </div>
  );
};

export default CurrentProject;
