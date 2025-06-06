import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient';

const FlSidebar = () => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  
    useEffect(() => {
      fetchUserAvatar();
    }, []);
  
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


    const fetchUserAvatar = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
    
      if (userError || !user) {
        console.error("User not found:", userError);
        return;
      }
    
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('profile_picture')
        .eq('userid', user.id)
        .single();
    
      if (profileError) {
        console.error("Profile error:", profileError);
        return;
      }
    
      if (userProfile?.profile_picture) {
        loadAvatar(userProfile.profile_picture);
      }
    };

  return (
    <div className='col-span-1 md:col-span-2 pt-6 px-4 w-auto sticky'>
        <aside className='flex flex-col items-center gap-6'>

        <div className="avatar w-24 h-24 rounded-full overflow-hidden border border-neutral-700">
          {avatarUrl ? (
            <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className='flex items-center justify-center w-full h-full bg-gray-200 text-gray-600 text-xl font-bold'>
              AV
            </div>
          )}
        </div>

        <ul className='flex flex-col gap-4 items-center'>
          <li><Link to="/jobposts" className='sb-main inline-flex items-center outline px-4 py-2 rounded'>Find a Job</Link></li>
          <li><Link to="/fl-dashboard">Dashboard</Link></li>
          <li><Link to="/my-applications">View Applications</Link></li>
          <li><Link to="/fl-profile">My Profile</Link></li>
          <li><Link to="/fl-profile">Chats</Link></li>
        </ul>
      </aside>
    </div>
  )
}

export default FlSidebar