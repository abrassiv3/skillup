import JobCard from '../components/JobCard'
import NavBar from '../components/NavBar'

const JobPosts = () => {  
  return (
    <div className='p-10'>
    {/* HP ADD FUNCTIONALITY TO FILTER AND SORT
     */}
    <NavBar/>
    <h1 className='section-header'>Available Jobs</h1>
    <JobCard/>
    </div>
  )
}

export default JobPosts