import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { userAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ActivePosts = () => {
  const { session } = userAuth();
  const [jobPosts, setJobPosts] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicationCounts, setApplicationCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      fetchJobPosts();
    }
  }, [session]);

  const fetchJobPosts = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('project_id, title, created_at, description, client_id(firstname, lastname), budget, selectedCategory(category_name), file_url, PublishedStatus, accepting')
      .eq('client_id', session.user.id)
      .eq('PublishedStatus', 'TRUE')
      .eq('accepting', 'TRUE');

    if (error) {
      console.log('Error fetching data: ', error);
    } else {
      setJobPosts(data);
      fetchSkills(data);
      fetchAllApplicationCounts(data);
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

      allSkills[project.project_id] = data.map((item) => item.skill.skill_name);
    }

    setSkills(allSkills);
  };

  const fetchAllApplicationCounts = async (projects) => {
    const counts = {};
    for (const project of projects) {
      const { count, error } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.project_id);

      if (error) {
        console.log('Error counting applications for project', project.project_id, error);
        continue;
      }

      counts[project.project_id] = count;
    }
    setApplicationCounts(counts);
  };

  const handlePublish = async (project_id) => {
    const { error } = await supabase
      .from('projects')
      .update({ PublishedStatus: 'FALSE', accepting: 'FALSE' }) 
      .eq('project_id', project_id);
  
    if (error) {
      console.error('Failed to publish:', error);
    } else {
      alert('Moved to Drafts.');
      fetchJobPosts(); 
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
      }

  ;

  return (
    <div className='w-full p-2'>
      <h2 className='section-header'>Posted Projects</h2>
      <ul className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {jobPosts.map((job) => (
          <li key={job.project_id}>
            <div className="go-to-jobs-card ">
              <div className="flex flex-row justify-between">
                <h2 className="py-1 px-3 font-bold w-fit text-amber-500 border border-amber-500 bg-neutral-800 rounded-2xl">
                  {job.selectedCategory.category_name}
                </h2>
                <p className="px-3 py-1 font-bold w-fit text-sky-500 border border-blue-500 bg-neutral-800 rounded-2xl">
                  Applications: {applicationCounts[job.project_id] ?? 0}
                </p>
              </div>
              
              <h2 className="text-left font-bold p-0.5 pl-0 border-b-2 border-b-neutral-700">{job.title}</h2>
              <p className='text-left border-b-2 border-b-neutral-700'><strong>Created on:</strong> {new Date(job.created_at).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>

              <div className='text-left' dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br/>') }}></div>
              
              <div className='py-2 border-y-2 border-y-neutral-700'>
                <p className="text-left py-0.5 "><strong>Skills</strong></p>
                  <div className="flex flex-row justify-between gap-2">
                  <ul className="flex flex-row justify-left gap-2">
                    {(skills[job.project_id] || []).map((skill, index) => (
                      <strong><li className="py-2 px-3 m-0.5 text-green-500 bg-neutral-800 border border-green-500 rounded-2xl" key=  {index}>{skill}</li></strong>
                      ))}
                  </ul>
                    
                  <p className="font-bold py-2 w-1/7 px-3 m-0.5 text-sky-500  bg-neutral-800 border border-blue-500 rounded-2xl">$  {job.budget}</p>
                </div>
              </div>

              {job.file_url && (          
              <p className='py-2'><a href={job.file_url} download className='font-bold py-2 w-1/7 px-3 m-0.5 text-sky-500  bg-neutral-800 border border-blue-500 rounded-2xl'> View Files</a></p>)}
              
              <div className='flex flex-row justify-center gap-2'>
                <button onClick={() => navigate(`/applications/${job.project_id}`)}>View Applications</button>
                <button className='btn-ter' onClick={() => handlePublish(job.project_id)}>Move to Drafts</button>
              </div>
              
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivePosts;
