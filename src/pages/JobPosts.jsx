import JobCard from '../components/JobCard'
import NavBar from '../components/NavBar'

const JobPosts = () => {  
  return (
    <div className='w-full pb-10 p-2'>
    <h1 className='section-header'>Available Jobs</h1>
    <JobCard/>
    </div>
  )
}

export default JobPosts