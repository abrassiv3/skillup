// import { useState, useEffect } from 'react'
// import { useNavigate, useParams } from 'react-router-dom'
// import backArrow from '../assets/arrow-back.svg'
// import { supabase } from '../supabaseClient'
// import React from 'react'
// import { userAuth } from '../context/AuthContext'

// const ReviewPost = () => {
//   const { id } = useParams() //HP Understand this part, if not necessary remove
//   const [jobPosts, setJobPosts] = useState([]);
//   const navigate = useNavigate()

//   const {session} = userAuth();

//   useEffect (() => {
//     fetchJobPost();
//   }, []);

//   const fetchJobPost = async (id) => {
//     const { data, error } = await supabase
//       .from('projects')
//       .select('project_id, title, description, client_id, budget, selectedCategory(category_name), PublishedStatus')
//       .eq("client_id", session.user.id)
//       .eq("PublishedStatus", "FALSE")
      
//        //HP Make it such that it fetches the intended created post when submitted from `CreatePost` made or when clicked to edit from `Drafts`
       
//     if (error) {
//       console.log("Error fetching data: ", error)
//     } else {
//       setJobPosts(data);
//     }
//   }

//   return (
//     <div>
//     <img className='icons back-arrow' src={backArrow} alt="back-arrow" onClick={() => navigate("/createpost")} />
//     <h1>Review post</h1>
//     <div>
//       <ul>{jobPosts.map((jobPosts) => (
//         <li>
//           <h2>{jobPosts.title}</h2>
//           <p>{jobPosts.description}</p>
//           <p>{jobPosts.skills}</p>
//           <p>{jobPosts.selectedCategory.category_name}</p>
//           <p>{jobPosts.PublishedStatus}</p>
//           <p className='pt-3 bg-green-900'>${jobPosts.budget}</p>
//           <button onClick={() => navigate("/createpost")}>Edit</button>
//     {/* LP Fetch draft post that brought user to this page and redirect to allow user to edit post
//     */}

//     <button onClick={() => navigate("/dashboard")}>Save as Draft</button>
//     {/* LP Add notificationfunction "Saved as draft"
//     */}

//     <button>Post</button> 
//     {/* LP Change publishedStatus to "TRUE" in table projects
//       LP Add notificationfunction "Posted"
//     */}
//         </li>
//         ))}
//       </ul>
//     </div>   
//     </div>
//   )
// }

// export default ReviewPost