import React, { useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAuth } from '../context/AuthContext';
import '../styling/signin.css';

const signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  const {session, signInUser} = userAuth();
  const navigate = useNavigate();
  // console.log(session);

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signInUser(email, password)

      if(result.success) {
        navigate('/dashboard')
      }
    } catch (err) {
      setError("an error occurred");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div>
      <form onSubmit={handleSignIn} className="max-w-md m-auto pt-24">
        <div className='input-container'>
          <h2 className="small-header sign-in">Sign In To Continue</h2>
          <label className='label' htmlFor="email">Email</label>
          <input onChange={(e) => setEmail(e.target.value)} className='p-3 mt-2' type="email" /*name="" id="" */ placeholder='Valid emails should have an @'/>
          <label className='label' htmlFor="password">Password</label>
          <input onChange={(e) => setPassword(e.target.value)} className='p-3 mt-2' type="password" /*name="" id="" */ placeholder='Password should not be less than 8 characters' minLength={8}/>
          <button type='submit' disabled={loading} className='mt-6 w=full'>Sign In</button>
          {error && <p className='text-red-600 text-center pt-4'>{error}</p>}
          <p className='sign-up-text'>Don't have an account? <Link to='/signup'>Sign up!</Link></p>
        </div>
      </form>
    </div>
  )
}

export default signin