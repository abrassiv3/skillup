import { useState } from 'react'
import { href } from 'react-router-dom'
import dashboard from './components/Dashboard'
import signup from './components/Signup'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

function App() {
  const navigate = useNavigate();

  return (
    <>
      <div class='go-to-jobs-card'>
      <p class='go-to-jobs-title'>Your Next <span class='go-to-jobs-opportunity'>Opportunity</span> Awaits</p>
      <a class='go-to-jobs-link'>View Jobs</a>
      <div class='nav-bar-container'>
        <div class='button-container'>
          <button>Sign up</button>
          <button>Log in</button>
        </div>            
      </div>
    </div>
    </>
  )
}

export default App