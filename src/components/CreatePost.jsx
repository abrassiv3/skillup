import React from 'react'

const createPost = () => {
    return (
        <div className='formSection'>
            <div className='formContainer'>
                <form className='createPostForm' action="" method="post">
                    <h2 className='createPostHeading'>New Project Post</h2>
                    
                    {/* Project Title */}
                    <label htmlFor="projectTitle">Project Title</label>
                    <input className='projectTitle' type="text" placeholder='Give your project a clear title' />

                    {/* Description */}
                    <label htmlFor="descriptionBox">Description</label>
                    <input type="text" name="descriptionBox" id="descriptionBox" placeholder='Add a brief description of the project' />
                    
                    {/* Files */}
                    <label htmlFor="file">Files (Optional)</label>
                    <input type="file" name="fileAddition" id="file" />

                    {/* Skills Required */}
                    <label htmlFor="skills">Skills Required</label>

                    {/* Budget */}
                    <label htmlFor="budget">Budget</label>
                    <input type="text" />
                    
                    {/* Submit Button */}
                    <button type="submit">Next</button>
                    {/* onClick should take to review section, where a preview of the post is, and there the client can approve of the post */}


                </form>
            </div>
        </div>
    )
}

export default createPost