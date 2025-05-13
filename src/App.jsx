import './index.css'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import NavBar from './components/NavBar';

function App() {
  const navigate = useNavigate();

  return (
    <>
    <NavBar />
    <h1 className="skillupheader text-center pt-4 pb-4 text-2xl">SKILLUP</h1>
      <div className='go-to-jobs-card w-2/4'>
        <p className='go-to-jobs-title'>Your Next <span className='go-to-jobs-opportunity'>Opportunity</span> Awaits</p>
        <Link className='go-to-jobs-link' to="/job-posts">View Jobs</Link>
        <div className='nav-bar-container'>
          <div className='button-container'>
            <button onClick={() => { navigate("/signup")}}>Sign Up</button>
            <button onClick={() => {navigate("/signin")}}>Sign in</button>
          </div>            
        </div>
      </div>
    </>
  )
}

export default App