import { useEffect, useState } from 'react';
import { userAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ChatroomList from '../components/ChatroomList';

const FlDashboard = () => {
  const { session } = userAuth();
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState({});
  const [showModal, setShowModal] = useState(false);
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
    .select('*, client_id(firstname, lastname), projectid(project_id, title, description, status)')
    .eq('freelancer_id', session.user.id);

  if (error) {
    console.error('Error fetching projects:', error);
  } else {
    const ongoing = data.filter(project => project.projectid?.status === 'ONGOING');

    setProjects(ongoing);

    ongoing.forEach(project => fetchMilestones(project.projectid.project_id));
  }

  setLoading(false);
};

const fetchMilestones = async (projectId) => {
  const { data, error } = await supabase
    .from('milestones')
    .select('*, projectid(description)')
    .eq('projectid', projectId);
  if (error) {
    console.error(`Error fetching milestones for project ${projectId}:`, error);
  } else {
    setMilestones(prev => ({ ...prev, [projectId]: data }));
  }
};

const handleOpenModal = (projectId) => {
  setCurrentProjectId(projectId);
  setShowModal(true);
};

if (loading) {
  return (
    <div className='w-full p-2'>
      <h2 className="section-header text-2xl font-semibold">Ongoing Projects</h2>
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
    <div className="w-full pb-8 p-2 min-w-2xl">
      <div className='grid grid-cols-10 gap-4'>
      <div className='col-span-4'>
        <h2 className="section-header">Your Chats</h2>
          <ChatroomList />
        </div>
      
      <div className='flex flex-col gap-2 col-span-6'>
        <h2 className="section-header">Ongoing Projects</h2>
      {projects.length === 0 ? (
        <p className="text-gray-400">No active projects found.</p>
      ) : (
        projects.map(project => (
        <div key={project.projectid} className="py-2 px-4 rounded-lg bg-neutral-900">
          <div className="flex items-center gap-6">
            <div className='flex flex-col w-full'>
              <h3 className="text-xl font-bold text-white">{project.projectid.title}</h3>
              <p className='font-bold w-full'>Client: {project.client_id.firstname} {project.client_id.lastname}</p>
            </div>
            <div className='flex flex-col w-2/3 justify-end gap-2'>
              <button
                onClick={() => handleOpenModal(project.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View Project Details
              </button>
              <button className='btn-ter' onClick={() => {navigate(`/project-milestones/${project.id}`)}}>View Progress</button>
            </div>
          </div>
        </div>
        ))
      )}
    </div>
  {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
    <div className="bg-neutral-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
      <h2 className="section-header text-2xl font-semibold text-white mb-4">
        Project Details
      </h2>

      {(() => {
        const currentProject = projects.find(p => p.id === currentProjectId);
        if (!currentProject) return <p className="text-neutral-400">Project not found.</p>;     

        return (
          <div className="mb-4 p-4 rounded-lg bg-neutral-900 w-full">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-white">
                {currentProject.projectid.title}
              </h3>
              <p className="font-bold text-gray-300">
                Client: {currentProject.client_id.firstname} {currentProject.client_id.lastname}
              </p>
              <p className="text-gray-300 mt-2">{currentProject.projectid.description}</p>
            </div>
          </div>
        );
      })()}


      <button
        type="button"
        className="btn-sec w-full mt-4"
        onClick={() => setShowModal(false)}
      >
        Close
      </button>
    </div>
  </div>
)}
</div>
    </div>
  );
};

export default FlDashboard;