import { useEffect, useState } from 'react'
import { userAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Welcome from './Welcome';

const DashboardHeader = () => {
    const {session, signOut} = userAuth();
    const navigate = useNavigate();
    const [dateTime, setDateTime] = useState(new Date());
  
    useEffect(() => {
      const interval = setInterval (() => {
        setDateTime(new Date());
      }, 1000)

      return () => clearInterval(interval)
    }, [])

    const handleSignOut = async (e) => {
      e.preventDefault();
      try {
        await signOut();
        navigate("/signin");
      } catch (err) {
        console.error(err);
      }
    }    

  return (
    <div className='p-5 flex justify-between items-center rounded-l-2xl bg-neutral-900'>
      <div className='welcome flex flex-col gap-1'>
        <Welcome/>
        <p id='datetime'>{session?.user?.email}<br/>{dateTime.toLocaleString(
                      'en-US', {weekday: 'long',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true})}
        </p>
      </div>
      <div>
        <button onClick={handleSignOut} className='btn-sec border inline-block px-4 py-3'>Sign out</button>
      </div>
    </div>
  )
}

export default DashboardHeader