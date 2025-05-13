import React, {useState, useEffect} from 'react'
import Sidebar from '../components/sidebar'
import fetchJobPost from '../api/dfsJobs'

const ArchivedPosts = () => {

const [jobPosts, setJobPosts] = useState([]);
const callJobs = async () => {
    const data = await fetchJobPost()
    setJobPosts(data)
  }

    useEffect (() => {
      callJobs();
    }, [])

  return (
    <div>
        <h1>Archived</h1>
    </div>
  )
}

export default ArchivedPosts