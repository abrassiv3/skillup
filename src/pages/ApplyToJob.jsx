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

    if (userProfile.usertype !== 'freelancer') {
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
                freelancer_id: freelancerId,
                client_id: clientId,
                project_id: jobId
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
            <div className="flex items-center justify-center h-screen bg-gradient-to-b">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-xl font-medium text-neutral-200">Loading...</p>
                </div>
            </div>
        );
    }
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 shadow-md mt-10">
            <h1 className="text-2xl font-bold mb-4">Apply to Job</h1>
            {job && (
                <div className="mb-6 p-4 border-2 border-green-600 rounded-xl">
                    <h2 className="text-xl font-semibold border-b-1 border-b-gray-400">Title: {job.title}</h2>
                    <p className=" mt-2 border-b-1 border-b-gray-400">Client: {job.client_id.firstname} {job.client_id.lastname}</p>
                    <p className=" mt-2 border-b-1 border-b-gray-400">Description: {job.description}</p>
                    <p className=" mt-2">
                        Budget: <span className="font-medium">${job.budget}</span>
                    </p>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 p-4">
                <label htmlFor="proposal" className="block text-2xl pt-2 text-center font-bold">
                    Proposal
                </label>
                <textarea
                    id="proposal"
                    name="proposal"
                    type="text"
                    placeholder="Write your proposal here..."
                    className="proposal-input block w-full"
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    required
                    wrap="soft"
                ></textarea>
                <button type="submit" className="w-full" onClick={() => navigate("/fl-dashboard")}>
                    Submit Application
                </button>
            </form>
        </div>
    );
};

export default ApplyToJob;
