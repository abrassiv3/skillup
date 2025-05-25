import { Link, useNavigate } from 'react-router-dom'

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <div className='flex flex-row justify-between py-2 px-4 items-center'>
      
      <div className=''><h1 className="skillupheader">SKILLUP</h1></div>

      <div className='flex justify-around  items-center'>
        <ul className='flex flex-row gap-7'>
            <li className='nav-bar-link'><Link to={"/"}>Home</Link></li>
            <li className='nav-bar-link'><Link to={"/job-posts"}>View Jobs</Link></li>
        </ul>
      </div>

      <div className='button-container  gap-4'>
        <button className='' onClick={() => { navigate("/signup")}}>Sign Up</button>
        <button className='' onClick={() => {navigate("/signin")}}>Sign in</button>
      </div>

    </div>
  )
}

export default NavBar