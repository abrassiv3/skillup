import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { userAuth } from '../context/AuthContext'

const Drafts = () => {
  const {session} = userAuth();
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState([]);
  const navigate = useNavigate()

  useEffect(() => {
    if (session) {
      fetchJobPost();
    }
  }, [session]);

  const fetchJobPost = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('project_id, created_at, title, description, client_id, budget, file_url, selectedCategory(category_name), PublishedStatus')
      .eq("client_id", session.user.id)
      .eq("PublishedStatus", "FALSE")
      .order('created_at', { ascending: false });
  
    if (error) {
      console.log("Error fetching data: ", error);
    } else {
      setJobPosts(data);
      fetchSkills(data);
      setLoading(false);
    }
  };
  

  const fetchSkills = async (projects) => {
    const allSkills = {};
  
    for (const project of projects) {
      const { data, error } = await supabase
        .from('project_skills')
        .select('skill:skill_id(skill_name)')
        .eq('project_id', project.project_id);
  
      if (error) {
        console.log('Error fetching skills for project', project.project_id, error);
        continue;
      }
  
      allSkills[project.project_id] = data.map(item => item.skill.skill_name);
    }
  
    setSkills(allSkills);
  };
  
  const handleDelete = async (projectId) => {
    const confirmDelete = confirm("Are you sure you want to delete this draft?");
    if (!confirmDelete) return;
  
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('project_id', projectId);
  
    if (error) {
      console.error('Failed to delete:', error);
    } else {
      alert('Draft deleted.');
      fetchJobPost(); // Refresh the list
    }
  };
  
  const handlePublish = async (projectId) => {
    const { error } = await supabase
      .from('projects')
      .update({ PublishedStatus: 'TRUE' , accepting: 'TRUE'})
      .eq('project_id', projectId);
  
    if (error) {
      console.error('Failed to publish:', error);
    } else {
      alert('Draft posted.');
      fetchJobPost(); // Refresh the list
    }
  }
  
if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-b">
            <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-xl font-medium text-neutral-200">Loading...</p>
            </div>
            </div>
        );
    };

  return (
    <div className='w-full p-2'>
      <h1 className='section-header'>Drafts</h1>
      <div>
        <ul className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {jobPosts.map((jobPosts) => (
          <li>
            <div className='go-to-jobs-card'>
              <div className="flex flex-row justify-between">
                <p className="py-1 px-3 font-bold w-fit bg-neutral-800  text-amber-500 border border-amber-500 rounded-2xl">  {jobPosts.selectedCategory.category_name}</p>
              </div>

              <h2 className='text-left font-bold p-0.5 pl-0 border-b border-b-neutral-500'>Project Title: {jobPosts.title}</h2>
              <p className="text-left font-bold py-0.5 pl-0 border-b border-b-neutral-500">Created on: {new Date(jobPosts.created_at).toLocaleString('en-US', {weekday: 'long',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true})}</p>
              <div className='text-left' dangerouslySetInnerHTML={{ __html: jobPosts.description.replace(/\n/g, '<br/>') }}></div>

              <p className="text-left py-0.5"><strong>Skills</strong></p>
                <div className="flex flex-row justify-between gap-2">
                <ul className="flex flex-row justify-left gap-2">
                  {(skills[jobPosts.project_id] || []).map((skill, index) => (
                    <strong><li className="py-2 px-3 m-0.5 text-green-500 bg-neutral-800 border border-green-500 rounded-2xl" key={index}>{skill}</li></strong>
                    ))}
                </ul>
                
                <p className="font-bold py-2 w-1/7 px-3 m-0.5 text-sky-500  bg-neutral-800 border border-blue-500 rounded-2xl">${jobPosts.budget}</p>
              </div>

            
            {jobPosts.file_url && (          
              <p className='py-2'><a href={jobPosts.file_url} download className='font-bold py-2 w-1/7 px-3 m-0.5 text-sky-500  bg-neutral-800 border border-blue-500 rounded-2xl'> View Files</a></p>)}

            <div className='flex flex-row justify-center gap-5'>
              <button className='w-1/3' onClick={() => handlePublish(jobPosts.project_id)}    >Post</button>

              <button className='w-1/3' onClick={() => navigate(`/createpost/${jobPosts.project_id}`)}>Edit</button>
              
              <button className='w-1/3 btn-sec' onClick={() => handleDelete(jobPosts.project_id)}   >Delete</button>
            </div>
            
            </div>
          </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Drafts