import { useEffect, useState } from 'react';
import { userAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'; 

export default function Welcome() {
  const {session} = userAuth();
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserProfile = async () => {
      if (session) {
        
        const { data, error } = await supabase
          .from('users')
          .select('firstname, usertype')
          .eq('userid', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user name:', error);
        } else {
          setUserName(data.firstname || '')
          setUserType(data.usertype|| '');
        }
      }
      setLoading(false);
    };

    getUserProfile();
  }, [session]);

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
    <div>
      <h1 className='welcome welcome-header'>Welcome, {userName}!</h1>
      <p className='py-1 px-3 m-0.5 text-green-500 bg-neutral-800 border border-green-500 rounded-2xl w-fit'>{userType}</p>
    </div>
  );
}


