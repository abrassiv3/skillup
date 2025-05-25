import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

const CreatePost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [skillsList, setSkillsList] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [budget, setBudget] = useState('');
  const [file, setFile] = useState(null);
  const [existingFileUrl, setExistingFileUrl] = useState(null);
  const [deleteExistingFile, setDeleteExistingFile] = useState(false);
  const [formError, setFormError] = useState(null);
  const [generating, setGenerating] = useState(false);


  // Fetch project for edit mode
  useEffect(() => {
    if (id) {
      fetchProjectForEdit(id);
    }
  }, [id]);

  const fetchProjectForEdit = async (id) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('project_id', id)
      .single();

    if (data) {
      setTitle(data.title);
      setDescription(data.description);
      setSelectedCategory(data.selectedCategory);
      setBudget(data.budget);
      if (data.file_url) setExistingFileUrl(data.file_url);

      // Fetch associated skills
      const { data: projectSkills } = await supabase
        .from('project_skills')
        .select('skill_id')
        .eq('project_id', id);

      if (projectSkills) {
        setSelectedSkills(projectSkills.map(ps => ps.skill_id));
      }
    }
  };

  const generateDescription = async () => {
  setGenerating(true);
  try {
    const response = await fetch("../api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title }),
});

if (!response.ok) {
  const errorText = await response.text(); // get raw error message
  console.error("Server error:", errorText);
  return;
}

const data = await response.json();
setDescription(data.description);
  } catch (error) {
    console.error("Failed to generate description:", error);
  } finally {
    setGenerating(false);
  }
};


  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchSkills(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("category")
      .select("category_id, category_name");

    if (data) {
      setCategory(data.map((item) => ({
        id: item.category_id,
        name: item.category_name,
      })));
    }
  };

  const fetchSkills = async (categoryId) => {
    const { data } = await supabase
      .from("skills")
      .select("skill_id, skill_name")
      .eq("category_id", categoryId);
      

    if (data) {
      setSkillsList(data.map(skill => ({
        id: skill.skill_id,
        name: skill.skill_name
      })));
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setDeleteExistingFile(true);
  };

  const toggleSkillSelection = (id) => {
    setSelectedSkills(prev =>
      prev.includes(id) ? prev.filter(skillId => skillId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !selectedCategory || !budget || !selectedSkills.length) {
      setFormError('Please fill in the required fields');
      return;
    }

    let fileUrl = existingFileUrl;

    // Delete existing file if replaced or deleted
    if (deleteExistingFile && existingFileUrl) {
      const pathParts = existingFileUrl.split("/files/")[1];
      if (pathParts) {
        await supabase.storage.from('files').remove([`uploads/${pathParts}`]);
      }
      fileUrl = null;
    }

    // Upload new file if selected
    if (file) {
      const filePath = `uploads/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);

      if (uploadError) {
        setFormError("File upload failed");
        console.error(uploadError);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);
      fileUrl = urlData.publicUrl;
    }

    try {
      let projectId = id;

      if (id) {
        //Update
        await supabase
          .from('projects')
          .update({
            title,
            description,
            selectedCategory,
            budget,
            file_url: fileUrl
          })
          .eq('project_id', id);

        await supabase
          .from('project_skills')
          .delete()
          .eq('project_id', id);
      } else {
        // Create
        const { data: newData } = await supabase
          .from('projects')
          .insert([{
            title,
            description,
            selectedCategory,
            budget,
            file_url: fileUrl
          }])
          .select()
          .single();

        projectId = newData.project_id;
      }

      // Insert skills
      for (const skillId of selectedSkills) {
        await supabase
          .from('project_skills')
          .insert({
            project_id: projectId,
            skill_id: skillId
          });
      }

      setFormError(null);
      navigate('/drafts');
    } catch (error) {
      console.error('Error:', error);
      setFormError('Project submission failed');
    }
  };


  return (
    <div className='p-2 pb-4'>
      <h1 className="section-header">{id ? 'Edit Project' : 'Start A New Project'}</h1>
      <div className='w-2/3 '>
        <form onSubmit={handleSubmit} className='flex flex-col gap-2 p-4'>
          {/* <h2 className='createPostHeading'>{id ? 'Edit Project' : 'New Project'}</h2> */}
          {formError && <p className="error font-bold text-red-600 text-center text-xl">{formError}</p>}

          <label className="header text-2xl">Project Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Add a title"
          />

          <label className="header text-2xl">Description</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Add your project description"
            className="w-full h-full"
            wrap="soft"
            required
          />
          <button 
  type="button" 
  className="btn-ter mt-2 w-max" 
  onClick={generateDescription}
  disabled={generating}
>
  {generating ? "Generating..." : "Generate Description with AI"}
</button>

          <label className="header text-2xl">Category</label>
          <select onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory}>
            <option className="select-default">Select Category</option>
            {category.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <label className="header text-2xl">Skills Required</label>
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

          <label className="header text-2xl">File (Optional)</label>

          {existingFileUrl && !deleteExistingFile && (
            <div>
              <a href={existingFileUrl} target="_blank" rel="noreferrer">View Existing File</a>
              <button type="button" className="btn-sec" onClick={() => setDeleteExistingFile(true)}>Delete File</button>
            </div>
          )}
          <input type="file" onChange={handleFileChange} />

          <label className="header text-2xl">Budget</label>
          <input type="number" placeholder="$" value={budget} onChange={(e) => setBudget(e.target.value)} />

          <button type="submit">{id ? 'Update' : 'Next'}</button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
