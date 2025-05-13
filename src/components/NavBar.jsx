import { Link } from 'react-router-dom'

const NavBar = () => {
  return (
    <div>
        <ul className='flex flex-row justify-around'>
            <li><Link to={"/"}>Home</Link></li>
            <li><Link to={"/job-posts"}>View Available Jobs</Link></li>
        </ul>
    </div>
  )
}

export default NavBar