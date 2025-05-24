import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styling/forms.css";

const FreelancerProfile = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [experience, setExperience] = useState("");
    const [category, setCategory] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [skillsList, setSkillsList] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [file, setFile] = useState(null);
    const [formError, setFormError] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            fetchSkills(selectedCategory);
        }
    }, [selectedCategory]);

    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from("category")
            .select("category_id, category_name");

        if (!error) {
            setCategory(data.map(item => ({ id: item.category_id, name: item.category_name })));
        } else {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchSkills = async (categoryId) => {
        const { data, error } = await supabase
            .from("skills")
            .select("skill_id, skill_name")
            .eq("category_id", categoryId);

        if (!error) {
            setSkillsList(data.map(skill => ({ id: skill.skill_id, name: skill.skill_name })));
        } else {
            console.error("Error fetching skills:", error);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const toggleSkillSelection = (id) => {
        setSelectedSkills(prev =>
            prev.includes(id)
                ? prev.filter(skillId => skillId !== id)
                : [...prev, id]
        );
    };

    const clearForm = () => {
        setTitle("");
        setExperience("");
        setSelectedCategory("");
        setSelectedSkills([]);
        setFile(null);
        setFormError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            setFormError("User not authenticated");
            return;
        }

        const freelancer_id = user.id;

        if (!title || !experience || !selectedCategory || selectedSkills.length === 0) {
            setFormError("Please fill in all the required fields");
            return;
        }

        try {
            let fileUrl = null;

            if (file) {
                const filePath = `profile-docs/${Date.now()}_${file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from("files")
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from("files")
                    .getPublicUrl(filePath);

                fileUrl = publicUrlData.publicUrl;
            }

            const { data: freelancerData, error: freelancerError } = await supabase
                .from("freelancer-data")
                .insert([
                    {
                        freelancer_id,
                        title,
                        experience,
                        selectedCategory,
                        file_url: fileUrl
                    }
                ])
                .select("fdid")
                .single();

            if (freelancerError) throw freelancerError;

            const fdid = freelancerData.fdid;

            const skillsToInsert = selectedSkills.map(skillId => ({
                fdid,
                freelancer_id,
                skill_id: parseInt(skillId)
            }));

            const { error: skillsError } = await supabase
                .from("freelancer_skills")
                .insert(skillsToInsert);

            if (skillsError) throw skillsError;

            setFormError(null);
            navigate("/fl-dashboard");
        } catch (error) {
            console.error("Submission Error:", error);
            setFormError("An error occurred while submitting the form. Please try again.");
        }
    };

    return (
        <div className="flex justify-center" >
        <div className="profile w-full max-w-2xl mx-auto ">
            <form className="flex flex-col p-6 gap-4" onSubmit={handleSubmit}>
    
 <div className="flex flex-col gap-2">
   <h1 className="section-header">Complete your profile</h1>
   <p className="header">This is basic information about who you are and the services you offer.</p>
 </div>

 <div className="flex flex-col gap-2">
   <label className="text-xl font-medium header" htmlFor="profile-title">Title</label>
   <input
     type="text"
     className="p-2  rounded bg-neutral-900 text-white focus:outline-none focus:ring focus:border-blue-500"
     value={title}
     onChange={(e) => setTitle(e.target.value)}
     placeholder="e.g. Graphic Designer, Data Analyst"
   />
 </div>

 <div className="flex flex-col gap-2">
   <label className="text-xl font-medium header" htmlFor="profile-experience">Experience</label>
   <textarea
                 id="proposal"
                 name="proposal"
                 type="text"
                 placeholder="Tell us about your experience"
                 className="proposal-input bg-neutral-900 py-4 w-full "
                 value={experience}
                 onChange={(e) => setExperience(e.target.value)}
                 required
                 wrap="soft"
             ></textarea>
 </div>

 <div className="flex flex-col gap-4">
  
   <label className="text-xl font-medium header" htmlFor="category">Category</label>
   <select
     className="p-2 border rounded bg-neutral-900 text-white focus:outline-none focus:ring focus:border-blue-500"
     value={selectedCategory}
     onChange={(e) => setSelectedCategory(e.target.value)}
   >
     <option value="">Select Category</option>
     {category.map(cat => (
       <option key={cat.id} value={cat.id}>{cat.name}</option>
     ))}
   </select>

   <label className="text-xl font-medium header" htmlFor="skills-select">Skills</label>
   <div className="flex flex-wrap gap-2 ">
     {skillsList.map(skill => (
       <button
         type="button"
         key={skill.id}
         className={`skill-chip ${selectedSkills.includes(skill.id) ? 'selected' : ''}`}
         onClick={() => toggleSkillSelection(skill.id)}
       >
         {skill.name}
       </button>
     ))}
   </div>
 </div>

 <div className="flex flex-col gap-2">
   <label className="text-xl font-medium header" htmlFor="files">Upload employment history document (optional)</label>
   <input
     type="file"
     className="file:bg-blue-800 file:text-white file:border-none file:rounded file:px-4 file:py-2 file:cursor-pointer bg-neutral-900 text-white"
     onChange={handleFileChange}
   />
 </div>

 <div className="flex flex-col gap-2">
   <div className="flex justify-center gap-4 py-4">
     <button
       type="submit"
       className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
     >
       Complete Upload
     </button>
     <button
       type="button"
       className="btn-sec"
       onClick={clearForm}
     >
       Clear Form
     </button>
   </div>
   {formError && <p className="font-bold text-red-500">{formError}</p>}
 </div>

  </form>
</div>
</div>
    );
}   

export default FreelancerProfile;