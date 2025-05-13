import { Link } from 'react-router-dom'

const FlSidebar = () => {
  return (
    <div>
        <aside>
        <ul>
          <li><Link to="/job-posts" className='sb-main inline-flex items-center outline px-4 py-2 rounded'>Find a Job</Link></li>
          <li><Link to="/fl-dashboard">Dashboard</Link></li>
          <li><Link to="/my-applications">View Applications</Link></li>
          <li><Link to="/fl-profile">My Profile</Link></li>
        </ul>
      </aside>
    </div>
  )
}

export default FlSidebar