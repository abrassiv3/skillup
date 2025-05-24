import { supabase } from "../supabaseClient";

const fetchJobPost = async () => {
  try {
    const { data: projects, error } = await supabase
      .from("projects")
      .select(`*, client_id(firstname, lastname), selectedCategory(category_name)`)
      .eq("PublishedStatus", "TRUE")
      .eq("accepting", "TRUE")
      .order("created_at", { ascending: true });

    if (error) throw error;

    const allSkills = {};
    const applicationCounts = {};

    for (const project of projects) {
      // Skills
      const { data: skillData, error: skillError } = await supabase
        .from("project_skills")
        .select("skill:skill_id(skill_name)")
        .eq("project_id", project.project_id);

      if (!skillError) {
        allSkills[project.project_id] = skillData.map(item => item.skill.skill_name);
      }

      // Application count
      const { count, error: countError } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("project_id", project.project_id);

      if (!countError) {
        applicationCounts[project.project_id] = count;
      }
    }

    return { projects, skills: allSkills, applicationCounts };
  } catch (error) {
    console.error("Error fetching job posts:", error);
    return { projects: [], skills: {}, applicationCounts: {} };
  }
};

export default fetchJobPost;
