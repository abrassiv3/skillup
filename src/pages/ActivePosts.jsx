import { useEffect, useState } from 'react';
import { userAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const ActivePosts = () => {
  const { session } = userAuth();
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState('');
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

const fetchProjects = async () => {
  setLoading(true);

  const { data, error } = await supabase
    .from('freelancer-projects')
    .select('*, projectid(project_id, title, status)')
    .eq('client_id', session.user.id);

  if (error) {
    console.error('Error fetching projects:', error);
  } else {
    // Filter only projects with status === 'ONGOING'
    const ongoing = data.filter(project => project.projectid?.status === 'ONGOING');

    setProjects(ongoing);

    // Fetch milestones only for ongoing projects
    ongoing.forEach(project => fetchMilestones(project.projectid.project_id));
  }

  setLoading(false);
};

  const fetchMilestones = async (projectId) => {
    const { data, error } = await supabase
      .from('milestones')
      .select('id, milestone')
      .eq('projectid', projectId);

    if (error) {
      console.error(`Error fetching milestones for project ${projectId}:`, error);
    } else {
      setMilestones(prev => ({ ...prev, [projectId]: data }));
    }
  };

  const handleOpenModal = (project) => {
    setCurrentProjectId(project);
    setShowModal(true);
  };

const handleAddMilestone = async (e) => {
  e.preventDefault();
  if (!newMilestone) return;

  const { error } = await supabase
    .from('milestones')
    .insert([{
      milestone: newMilestone,
      projectid: currentProjectId.projectid.project_id,
      fpid: currentProjectId.id
    }]);


  if (error) {
    console.error('Error adding milestone:', error);
  } else {
    fetchMilestones(currentProjectId.projectid.project_id);
    setNewMilestone('');
    setShowModal(false);
  }
};


  const handleDeleteMilestone = async (milestoneId, projectId) => {
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', milestoneId);
    if (error) {
      console.error('Error deleting milestone:', error);
    } else {
      fetchMilestones(projectId);
    }
  };


  if (loading) {
        return (
          <div className='w-full p-2'>
            <h2 className="section-header text-2xl font-semibold">Active Posts</h2>
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
    <div className="w-full pb-8 p-2">
      <h2 className="section-header">Active Posts</h2>

      {projects.length === 0 ? (
        <p className="text-gray-400">No active projects found.</p>
      ) : (
        projects.map(project => (
          <div key={project.projectid} className="p-4 rounded-lg bg-neutral-900">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{project.projectid.title}</h3>
              
              <div className='flex gap-4'>
              <button
                onClick={() => handleOpenModal(project)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                + Add Milestone
              </button>
              <button className='btn-ter' onClick={() => {navigate(`/project/${project.projectid.project_id}`)}}>View Progress</button>
              </div>

            </div>
            
            <ul className="mt-4 space-y-2">
              {milestones[project.projectid.project_id]?.map(milestone => (
                <li key={milestone.id} className="flex justify-between items-center  bg-neutral-800 p-2 rounded">
                  <span>{milestone.milestone}</span>
                  <button
                    onClick={() => handleDeleteMilestone(milestone.id, project.id)}
                    className="btn-sec"
                  >
                    Delete
                  </button>
                </li>
              )) || <p className="text-gray-400">No milestones yet.</p>}
            </ul>
          </div>
        ))
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="section-header text-2xl font-semibold text-white">Add Milestone</h2>
            <form onSubmit={handleAddMilestone} className="flex flex-col p-4 gap-4">
              <textarea
                type="text"
                placeholder="Set a new milestone"
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
              />
              <div className="flex justify-even gap-4">
                <button
                  type="submit"
                  className="w-full"
                >
                  Add
                </button>
                <button
                  type="button"
                  className="btn-sec w-full"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivePosts;
