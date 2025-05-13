import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import fetchJobPost from '../api/dfsJobs';
import '../app.css'

const JobCard = () => {
  const [jobPosts, setJobPosts] = useState([]);
  const [skills, setSkills] = useState({});
  const [applicationCounts, setApplicationCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const checkUserType = async (job) => {
    const {data: { user },error: userError} = await supabase.auth.getUser();

    if (userError || !user) {
        console.error("Error fetching user:", userError);
        alert("Sign in to apply for jobs");
        navigate("/signin");
        return;
    }

    const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("userid, usertype")
        .eq("userid", user.id)
        .single();

    if (profileError) {
        console.error("Error fetching user profile:", profileError);
        alert("Error verifying user profile.");
        return;
    }

    if (userProfile.usertype !== 'freelancer') {
        alert("You must be a freelancer to submit proposals.");
        navigate("/dashboard");
        return;
    } else {
        navigate(`/apply-to-job/${job.project_id}`)
    }}

  useEffect(() => {
      const getJobs = async () => {
      const { projects, skills, applicationCounts } = await fetchJobPost();
      setJobPosts(projects);
      setSkills(skills);
      setApplicationCounts(applicationCounts);
      setLoading(false);
    };
    getJobs();  
  }, []);

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
      <ul className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {jobPosts.map((job) => (
          <li key={job.project_id}>
            <div className="go-to-jobs-card m-1">
              <div className="flex flex-row justify-between">
                <h2 className="py-1 px-3 font-bold w-fit bg-neutral-800 text-amber-500 border border-amber-500 rounded-2xl">
                  {job.selectedCategory.category_name}
                </h2>
                <p className="px-3 py-1 font-bold w-fit bg-neutral-800 text-sky-500 border border-blue-500 rounded-2xl">
                  Applications: {applicationCounts[job.project_id] ?? 0}
                </p>
              </div>


              <h2 className="text-left font-bold p-0.5 pl-0 border-b border-b-neutral-500">{job.title}</h2>
              <p className="text-left font-bold p-0.5 pl-0 border-b border-b-neutral-500">Client: {job.client_id.firstname} {job.client_id.lastname}</p>
              <p className="text-left font-bold py-0.5 pl-0 border-b border-b-neutral-500">Posted on: {new Date(job.created_at).toLocaleString('en-US', {weekday: 'long',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true})}</p>
              <div className='text-left' dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br/>') }}></div>

                <p className="text-left py-0.5"><strong>Skills</strong></p>
                <div className="flex flex-row justify-between gap-2">
                <ul className="flex flex-row justify-left gap-2">
                  {(skills[job.project_id] || []).map((skill, index) => (
                    <strong><li className="py-2 px-3 m-0.5 text-green-500 bg-neutral-800 border border-green-500 rounded-2xl" key={index}>{skill}</li></strong>
                    ))}
                </ul>
                
                <p className="font-bold py-2 w-1/7 px-3 m-0.5 text-sky-500  bg-neutral-800 border border-blue-500 rounded-2xl">${job.budget}</p>
              </div>

              {job.file_url && (          
              <p className='py-2'><a href={job.file_url} download className='font-bold py-2 w-1/7 px-3 m-0.5 text-sky-500  bg-neutral-800 border border-blue-500 rounded-2xl'> View Files</a></p>)}
              
              <button onClick={()=>checkUserType(job)}>Apply</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobCard;
