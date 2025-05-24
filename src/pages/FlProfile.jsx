import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import plus from '../assets/add.svg';

const FlProfile = () => {
  const [profile, setProfile] = useState({
    firstname: '',
    lastname: '',
    profilepicture: ''
  });
  const [freelancerData, setFreelancerData] = useState({
    title: '',
    experience: '',
    selectedCategory: ''
  });
  const [categories, setCategories] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('category')
    .select('category_id, category_name');
  
  if (error) {
     console.error("Error fetching categories:", error);
   } else {
     setCategories(data);
   }
  };

  const fetchUserProfile = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User not found:", userError);
    return;
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('firstname, lastname, profile_picture')
    .eq('userid', user.id)
    .single();

  const { data: flData, error: flError } = await supabase
    .from('freelancer-data')
    .select('title, experience, "selectedCategory"')
    .eq('freelancer_id', user.id)
    .single();

    if (profileError) console.error("Profile error:", profileError);
    else setProfile(userProfile);
  
    if (flError) console.error("Freelancer data error:", flError);
    else setFreelancerData(flData);
  
    if (userProfile?.profile_picture) {
      loadAvatar(userProfile.profile_picture);
    }
  };
  
  const handleFreelancerChange = (e) => {
    const { name, value } = e.target;
    setFreelancerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const loadAvatar = (filePath) => {
    if (!filePath) return;

    const { data, error } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (data?.publicUrl) {
      // Add cache-busting timestamp
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    } else if (error) {
      console.error("Error fetching avatar URL:", error);
    }
  };

  const handleFileChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError;

    let updatedUserFields = {
      firstname: profile.firstname,
      lastname: profile.lastname
    };

    // === Upload and replace avatar ===
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `avatars/${user.id}.${fileExt}`;

      // Upload with upsert to replace
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      updatedUserFields.profile_picture = filePath;
      loadAvatar(filePath); // refresh the view
    }

    // === Update users table ===
    const { error: updateUserError } = await supabase
      .from('users')
      .update(updatedUserFields)
      .eq('userid', user.id);

    if (updateUserError) throw updateUserError;

    // === Update freelancer-data table ===
    const { error: freelancerError } = await supabase
      .from('freelancer-data')
      .upsert({
        freelancer_id: user.id,
        title: freelancerData.title,
        experience: freelancerData.experience,
        selectedCategory: parseInt(freelancerData.selectedCategory) || 0
      }, {
        onConflict: 'freelancer_id'
      });

    if (freelancerError) throw freelancerError;

    setFormError(null);
    alert("Profile updated successfully!");
  } catch (error) {
    console.error("Error updating profile:", error);
    setFormError("Failed to update profile.");
  } finally {
    setLoading(false);
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

  return (
    <div className='w-full mx-auto p-4'>
      <h2 className='section-header text-2xl font-bold mb-6'>My Profile</h2>

      <div>{formError && <p className="text-red-600 text-2xl text-center font-bold">{formError}</p>}</div>

      {/* Editable Form */}
      <form onSubmit={handleSubmit} className="space-y-4 w-full h-fit p-3 flex gap-4">
        <div className='flex flex-col w-full'>
          <div>
            <h2 className='header text-center'>Update Your Personal Details</h2>
          </div>
          
          <div className='py-2'>
            <h2 className='header'> Profile Picture</h2>
            <div className='flex flex-col items-center gap-2'>

              {/* Avatar Display and Upload */}
              <div className="avatar w-32 h-32 rounded-full overflow-hidden border border-gray-300 mx-auto">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className='flex items-center justify-center w-full h-full text-xl font-bold'>
                    AV
                  </div>
                )}
              </div>
              <label className='flex items-center gap-2' htmlFor="avatar"><img src={plus} alt="add image" className='border-2 border-green-600 rounded-full'/> <p className='font-bold'>Change Picture</p></label>
              <input type="file" id='avatar' class="hidden" onChange={handleFileChange} accept="image/*" />
            </div>
          </div>

          <div className='py-2'>
            <label className="header block">First Name</label>
            <input
              type="text"
              name="firstname"
              value={profile.firstname}
              onChange={handleFreelancerChange}
              className="input border py-2 w-full"
              required
            />
          </div>

          <div className='py-2'>
            <label className="header block">Last Name</label>
            <input
              type="text"
              name="lastname"
              value={profile.lastname}
              onChange={handleFreelancerChange}
              className="input border py-2 w-full"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="flex flex-row justify-around">
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </div>
        
        <div className='flex flex-col w-full'>
          <div>
            <h2 className='header text-center'>Update your Resumé</h2>
          </div>
          <div className='py-2'>
            <label className="header block">Title</label>
            <input
              type="text"
              name="title"
              value={freelancerData.title}
              onChange={handleFreelancerChange}
              className="input border py-2 w-full"
              required
            />
          </div>
          <div className='py-2'>
            <label className="header block">Experience</label>
            <textarea
              name="experience"
              value={freelancerData.experience}
              onChange={handleFreelancerChange}
              className="input border py-2 w-full h-90"
              required
            />
          </div>

          <div className='py-2'>
            <label className="header block">Category</label>
            <select
              name="selectedCategory"
              value={freelancerData.selectedCategory}
              onChange={handleFreelancerChange}
              className="input border py-2 w-full"
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={loading} className="flex flex-row justify-around">
          {loading ? "Updating..." : "Update Your Resumé"}
        </button>
        </div>
      </form>
      </div>
    
  );
};
export default FlProfile