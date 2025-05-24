import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import '../styling/sign.css';
import backArrow from '../assets/arrow-back.svg';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signInUser } = userAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signInUser(email, password);
      if (result.success) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('usertype')
          .eq('userid', result.data.session.user.id)
          .single();

        if (profileError || !profile) {
          setError('Failed to fetch user profile');
          return;
        }

        if (profile.usertype === 'Client') {
          navigate('/dashboard');
        } else if (profile.usertype === 'Freelancer') {
          navigate('/fl-dashboard');
        } else {
          setError('Unknown user type');
        }
      } else {
        setError(result.error?.message || 'Failed to sign in');
      }
    } catch (err) {
      console.log(err)
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center'>
      <h1 className="skillupheader text-center pt-4 pb-4 text-2xl">SKILLUP</h1>

      <form onSubmit={handleSignIn} className="max-w-md m-auto w-fit">
        <div className="input-container">
          
          <div className="input-header">
            <img className="icons back-arrow" src={backArrow} alt="back-arrow" onClick={() => navigate('/')} />
            <h2 className="small-header sign-in">Sign In To Continue</h2>
          </div>
          
          <label className="label" htmlFor="email">Email</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Valid emails should have an @"
            required
          />
          <label className="label" htmlFor="password">Password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password should not be less than 8 characters"
            minLength={8}
            required
            />
          
          <button type="submit" disabled={loading} className="mt-6 w-full">Sign In</button>
          {error && <p className="text-red-600 font-bold text-center pt-4">{error}</p>}
          
          <p className="sign-up-text">Don't have an account? <Link to="/signup">Sign up!</Link></p>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
