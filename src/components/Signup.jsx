import React, { useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userAuth } from '../context/AuthContext';
import '../styling/signup.css';

const signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  const {session, signUpNewUser} = userAuth();
  const navigate = useNavigate();
  // console.log(session);

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signUpNewUser(email, password)

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
      <form onSubmit={handleSignUp} className="max-w-md m-auto pt-24">
        <h2 className="font-bold pt-2">Sign Up Today!</h2>
        <p>Already have an account? <Link to='/signin'>Sign in!</Link></p>
        <div className='flex flex-col py-4'>
          <input onChange={(e) => setEmail(e.target.value)} className='p-3 mt-6' type="email" /*name="" id="" */ placeholder='Valid emails should have an @'/>
          <input onChange={(e) => setPassword(e.target.value)} className='p-3 mt-6' type="password" /*name="" id="" */ placeholder='Password should not be less than 8 characters' minLength={8}/>
          <button type='submit' disabled={loading} className='mt-6 w=full'>Sign Up</button>
          {error && <p className='text-red-600 text-center pt-4'>{error}</p>}
        </div>
      </form>
    </div>
  )
}

export default signup