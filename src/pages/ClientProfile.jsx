import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import plus from '../assets/add.svg';

const ClientProfile = () => {
  const [profile, setProfile] = useState({
    firstname: '',
    lastname: '',
    profilepicture: ''
  });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User not found:", userError);
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('firstname, lastname, profile_picture')
      .eq('userid', user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
      if (data.profile_picture) {
        loadAvatar(data.profile_picture);
      }
    }
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
  const file = e.target.files[0];
  if (file) {
    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      let updatedFields = {
        firstname: profile.firstname,
        lastname: profile.lastname
      };

      if (avatarFile) {
        const filePath = `${user.id}`;
        const { error: uploadError } = await supabase
          .storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        updatedFields.profile_picture = filePath;
        loadAvatar(filePath);
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(updatedFields)
        .eq('userid', user.id);

      if (updateError) throw updateError;

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
            <div className='w-full p-2'>
              <h2 className='section-header text-2xl font-bold mb-6'>My Profile</h2>
              <div className="flex items-center justify-center h-screen bg-gradient-to-b">
              <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-xl font-medium text-neutral-200">Loading...</p>
              </div>
              </div>
            </div>
          );
      }

  return (
    <div className='w-full mx-auto p-4'>
          <h2 className='section-header text-2xl font-bold mb-6'>My Profile</h2>
    
          <div>{formError && <p className="text-red-600 text-2xl text-center font-bold">{formError}</p>}</div>
    
          {/* Editable Form */}
          <form onSubmit={handleSubmit} className="space-y-4 w-2/3 h-fit p-3 flex gap-4">
            <div className='flex flex-col w-full'>
              <div>
                <h2 className='header text-3xl'>Update Your Personal Details</h2>
              </div>
              
              <div className='py-2'>
                <h2 className='header text-center'> Profile Picture</h2>
                
                <div className='flex flex-col items-center gap-2'>
                  <div className='py-2'>
  <h2 className='header text-center'> Profile Picture</h2>
  <div className='flex flex-col items-center gap-2'>
    <div className="avatar w-32 h-32 rounded-full overflow-hidden border border-gray-300 mx-auto">
      {avatarUrl ? (
        <img src={avatarUrl} alt="Profile Avatar" className="w-full h-full object-cover" />
      ) : (
        <div className='flex items-center justify-center w-full h-full text-xl font-bold bg-gray-200'>
          AV
        </div>
      )}
    </div>
  </div>
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  className="input border py-2 w-full"
                  required
                />
              </div>
    
              <button type="submit" disabled={loading} className="flex flex-row justify-around">
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </div>
        
      </form>
    </div>
  );
};

export default ClientProfile;