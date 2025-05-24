import { useState, useEffect } from "react";
import {useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

const ApplyToJob = () => {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [proposal, setProposal] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const { data, error } = await supabase
                    .from("projects")
                    .select("*, client_id(firstname, lastname), selectedCategory(category_name)")
                    .eq("project_id", jobId)
                    .single();

                if (error) throw new Error("Failed to fetch job details.");

                setJob(data);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch job details.");
                setLoading(false);
            }
        };

        fetchJob();
    }, [jobId]);

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error("Error fetching user:", userError);
        alert("User not authenticated.");
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

    if (userProfile.usertype !== 'Freelancer') {
        alert("You must be a freelancer to submit proposals.");
        navigate("/dashboard");
        return;
    }

    const freelancerId = userProfile.userid;

        // Fetch project to get client_id
        const { data: projectData, error: projectError } = await supabase
            .from("projects")
            .select("client_id")
            .eq("project_id", jobId)
            .single();

        if (projectError || !projectData) {
            console.error("Error fetching project:", projectError);
            alert("Project not found.");
            return;
        }

        const clientId = projectData.client_id;

        const { error: insertError } = await supabase
            .from("applications")
            .insert([{
                proposal: proposal,
                freelancerid: freelancerId,
                client_id: clientId,
                projectid: jobId
            }]);

        if (insertError) {
            throw insertError;
        }

        alert("Application submitted successfully!");
        setProposal(""); 
    } catch (err) {
        console.error("Submission error:", err);
        alert("Failed to submit application.");
    }
};


    if (loading) {
        return (
            <div className="w-full p-2">
            <h1 className="section-header">Apply to Job</h1>
            <div className="flex items-center justify-center h-screen bg-gradient-to-b">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                    <p className="pt-4 text-xl font-medium text-neutral-200">Loading...</p>
                </div>
            </div>
        </div>
        );
    }
    if (error) return <div className="text-center pt-10 text-red-500">{error}</div>;

    return (
        <div className="p-2 pb-4">
            <h1 className="section-header">Apply to Job</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">

            <div className="pt-2 pb-4 columns-1">
                {job && (
                <div className="p-4 h-full bg-neutral-700 rounded-xl">
                    <p className="font-bold py-0.5 w-fit px-2 rounded-2xl text-amber-500  bg-neutral-800 border border-amber-500 rounded-2xl'">{job.selectedCategory.category_name}</p>
                    <h2 className="text-xl font-bold py-1 border-b-1 border-b-neutral-400">Title: {job.title}</h2>
                    <p className=" pt-2 border-b-1 border-b-neutral-400"><strong>Client:</strong> {job.client_id.firstname} {job.client_id.lastname}</p>
                    <div className='text-left border-b-1 border-b-neutral-400' dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br/>') }}></div>
                    <div className="pt-2 ">
                        <p className="font-bold py-0.5 w-fit px-3 m-0.5 text-emerald-400  bg-neutral-800 border border-emerald-400 rounded-2xl">${job.budget}</p>
                    </div>
                    
                </div>
                )}
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col px-4 py-2 gap-2 columns-1 items-center">
                <label htmlFor="proposal" className="block text-2xl  text-center font-bold">
                    Proposal
                </label>
                <textarea
                    id="proposal"
                    name="proposal"
                    type="text"
                    placeholder="Write your proposal here..."
                    className="py-4 w-full h-full"
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    required
                    wrap="soft"
                ></textarea>
                <button type="submit" className="w-fit" onClick={() => navigate("/fl-dashboard")}>
                    Submit Application
                </button>
            </form>
        </div>
        </div>
    );
};

export default ApplyToJob;
