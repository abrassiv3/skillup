import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ProjectMilestones = () => {
  const { id } = useParams();
  const navigate =useNavigate()
  const [milestones, setMilestones] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingMilestoneId, setUploadingMilestoneId] = useState(null);
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
      .select('id, milestone, approved, fileURL, completed, projectid(project_id, title, status)')
      .eq('fpid', id);

    if (error) {
      console.error('Error fetching milestones:', error);
    } else {
      setMilestones(data);
    }
    setLoading(false);
  };

  // Handle file upload to Supabase Storage and update fileURL
  const handleFileUpload = async (milestoneId) => {
    if (!selectedFile) return;
    try {
      setUploadingMilestoneId(milestoneId);

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${milestoneId}_${Date.now()}.${fileExt}`;
      const filePath = `milestone_files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, selectedFile, { upsert: true });

      if (uploadError) {
        console.error('Upload failed:', uploadError);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      const fileUrl = publicUrlData.publicUrl;

      // Update milestone with fileURL
      const { error: updateError } = await supabase
        .from('milestones')
        .update({ fileURL: fileUrl })
        .eq('id', milestoneId);

      if (updateError) {
        console.error('Error updating milestone:', updateError);
      } else {
        fetchMilestones();
        setSelectedFile(null);
      }
    } finally {
      setUploadingMilestoneId(null);
    }
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


  // Toggle completed state
  const handleCheckboxChange = async (milestoneId, currentValue) => {
    const { error } = await supabase
      .from('milestones')
      .update({ completed: !currentValue })
      .eq('id', milestoneId);

    if (error) {
      console.error('Error updating completed status:', error);
    } else {
      fetchMilestones();
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

      {milestones.length > 0 ? 
      <div>
       <p>Project: {milestones[0].projectid.title}</p> 
       <p className='font-bold py-0.5 w-fit px-2 bg-neutral-800 border rounded-2xl text-blue-400'>Status: {milestones[0].projectid.status}</p> 
      </div> : '' }

      {milestones.length === 0 ? (
        <div className='flex flex-col gap-4 items-center'>
        <p className='text-3xl'>No milestones found for this project.</p>
        <button onClick={() => navigate('/fl-dashboard')}>Back to Active Posts</button>
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

                <div className="mt-4 flex items-center space-x-4">
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleFileUpload(milestone.id)}
                    disabled={uploadingMilestoneId === milestone.id || !selectedFile || milestone.status === "APPROVED"}
                    className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {uploadingMilestoneId === milestone.id ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>

                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={milestone.completed}
                    onChange={() => handleCheckboxChange(milestone.id, milestone.completed)}
                    className="mr-2"
                  />
                  Mark as Completed
                </label>
              </div>        
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectMilestones;
