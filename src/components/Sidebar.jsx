import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Sidebar = () => {
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    fetchUserAvatar();
  }, []);

  const fetchUserAvatar = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User not found:", userError);
      return;
    }

    // Construct the path assuming you store the avatar as 'user.id'
    const filePath = `${user.id}`;

    const { data, error } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (error) {
      console.error("Error fetching avatar URL:", error);
      return;
    }

    if (data?.publicUrl) {
      setAvatarUrl(data.publicUrl);
    }
  };

  return (
    <div className='col-span-1 md:col-span-2 pt-6 px-4 w-auto'>
      <aside className='flex flex-col items-center gap-6'>
        {/* Avatar Section */}
        <div className="avatar w-24 h-24 rounded-full overflow-hidden border border-gray-300 shadow-md">
          {avatarUrl ? (
            <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className='flex items-center justify-center w-full h-full bg-gray-200 text-gray-600 text-xl font-bold'>
              AV
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <ul className='flex flex-col gap-4 items-center'>
          <li><Link to="/createpost" className='sb-main inline-flex items-center outline px-4 py-2 rounded'>New Post</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link>Find a Service</Link></li>
          <li><Link to="/drafts">My Drafts</Link></li>
          <li><Link to="/messages">Messages</Link></li>
          <li><Link to="/archive">Archived Posts</Link></li>
          <li><Link to="/client-profile">My Profile</Link></li>
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
