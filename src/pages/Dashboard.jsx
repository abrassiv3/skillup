import ActivePosts from './ActivePosts'
import ChatroomList from '../components/ChatRoomList';
import '../app.css'

const Dashboard = () => {
  return (
    <div className='grid grid-cols-10 gap-4'>
      <div className='col-span-4'>
        <h2 className="section-header">Your Chats</h2>
          <ChatroomList />
        </div>
        <div className='dashboard-content col-span-6'>
          <h2 className="section-header">Active Posts</h2>
          <ActivePosts />
        </div>
        
    </div>
  )
}

export default Dashboard
