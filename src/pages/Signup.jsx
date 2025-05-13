import React, { useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userAuth } from '../context/AuthContext';
import '../styling/sign.css';
import backArrow from '../assets/arrow-back.svg'

const signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {session, signUpNewUser} = userAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("") 
    
    try {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
      return;
      }
      const result = await signUpNewUser(email, password)
      if(result.success) {
        navigate('/create-user')
      }
    } catch (err) {
      console.error("an error occurred", err);
      setError("an error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="skillupheader text-center pt-4 pb-4 text-2xl">SKILLUP</h1>
      <form onSubmit={handleSignUp} className="max-w-md m-auto pt-24">
      <div className='input-container'>
        <div className='input-header'>
          <img className='icons back-arrow' src={backArrow} alt="back-arrow" onClick={() => navigate("/")} />
          <h2 className="small-header sign-up">Sign Up Today!</h2>
        </div>

        <label className='label' htmlFor='email'>Email</label>
        <input 
          onChange={(e) => setEmail(e.target.value)} 
          id='email'
          type="email"
          placeholder='Valid emails should have an @'/>
          
        <label className='label' htmlFor="password">Password</label>
        <input
          id='password' 
          onChange={(e) => setPassword(e.target.value)} 
          type="password"
          placeholder='Password should not be less than 8 characters'
          minLength={8}/>

        <label className='label' htmlFor="confirmPassword">Retype Password</label>
        <input
          id='confirmPassword'
          onChange={(e) => setconfirmPassword(e.target.value)}
          type="Password"
          placeholder='Confirm written password' 
          minLength={8}/>

        <button type='submit' disabled={loading} className='mt-6 w=full'>Sign Up</button>
          
        {error && <p className='text-red-600 text-center font-bold pt-4'>{error}</p>}           
        
        <p className='sign-in-text'>Already have an account? <Link to='/signin'>Sign in!</Link></p>
      </div>
      </form>
    </div>
  )
}

export default signup