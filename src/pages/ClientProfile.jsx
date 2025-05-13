import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

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

  if (filePath.startsWith('http')) {
    setAvatarUrl(filePath);
  } else {
    const { data, error } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (data?.publicUrl) {
      setAvatarUrl(data.publicUrl);
    } else if (error) {
      console.error("Error fetching avatar URL:", error);
    }
  }
};

  const handleFileChange = (e) => {
    setAvatarFile(e.target.files[0]);
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
              <div className="flex items-center justify-center h-screen bg-gradient-to-b">
              <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-xl font-medium text-neutral-200">Loading...</p>
              </div>
              </div>
          );
      }

  return (
    <div className='w-full max-w-xl mx-auto p-4'>
      <h2 className='section-header text-2xl font-bold mb-6'>My Profile</h2>

      {formError && <p className="text-red-600">{formError}</p>}

      {/* Avatar Display and Upload */}
      <div className="avatar w-32 h-32 rounded-full overflow-hidden border border-gray-300 shadow-md mx-auto mb-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className='flex items-center justify-center w-full h-full text-xl font-bold'>
            AV
          </div>
        )}
      </div>

      <input type="file" onChange={handleFileChange} accept="image/*" />

      {/* Editable Form */}
      <form onSubmit={handleSubmit} className="space-y-4 ">
        <div className='p-2'>
          <label className="block">First Name</label>
          <input
            type="text"
            name="firstname"
            value={profile.firstname}
            onChange={handleInputChange}
            className="input border p-2 w-full"
            required
          />
        </div>
        <div className='p-2'>
          <label className="block">Last Name</label>
          <input
            type="text"
            name="lastname"
            value={profile.lastname}
            onChange={handleInputChange}
            className="input border p-2 w-full"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="flex flex-row justify-around">
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default ClientProfile;