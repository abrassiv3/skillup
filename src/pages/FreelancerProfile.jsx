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
        <div>
            <form className="profile-form" onSubmit={handleSubmit}>
                <div className="profile profile-header">
                    <h1>Complete your profile</h1>
                    <p>This is basic information about who you are and the services you offer.</p>
                </div>

                <div className="profile profile-title">
                    <h2>What do you do?</h2>
                    <label htmlFor="profile-title">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Graphic Designer, Data Analyst"
                    />
                </div>

                <div className="profile profile-experience">
                    <h2>Tell us about your experience</h2>
                    <label htmlFor="profile-experience">Experience</label>
                    <input
                        type="text"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                    />
                </div>

                <div>
                    <h2>Your Skillset</h2>
                    <label htmlFor="category">Category</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Select Category</option>
                        {category.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <label htmlFor="skills-select">Skills</label>
                    <div className="skills-chip-container">
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

                <div className="profile files">
                    <h2>Employment History</h2>
                    <label htmlFor="files">Upload document (optional)</label>
                    <input type="file" onChange={handleFileChange} />
                </div>

                <div className="profile profile-footer">
                    <button type="submit">Complete Upload</button>
                    <button type="button" onClick={clearForm}>Clear Form</button>
                    {formError && <p className="error">{formError}</p>}
                </div>
            </form>
        </div>
    );
};

export default FreelancerProfile;