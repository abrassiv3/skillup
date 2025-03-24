import React from 'react'
import { userAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const dashboard = () => {
  const {session, signOut} = userAuth();
  const navigate = useNavigate();

  // console.log(session);

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      await signOut();
      navigate("/signin");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Welcome, {session?.user?.email}</h2>

      <div>
        <button onClick={handleSignOut} className='hover:cursor-pointer border inline-block px-4 py-3 mt-4'>Sign out</button>
      </div>

      <button navigate={"/createpost"}>Create Post</button>
    </div>
  )
}

export default dashboard