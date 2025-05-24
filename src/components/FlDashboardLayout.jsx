import DashboardHeader from './Header'
import FlSidebar from './FlSidebar'
import { Outlet } from 'react-router-dom'

const DashboardLayout = () => {
  return (
    <div className='dashboard-layout '>
      <div className=' grid gap-3 grid-cols-12'>
      <FlSidebar />
        <main className='dashboard-content col-span-10'>
          <DashboardHeader />
          <div className='px-5'>
            <Outlet />
          </div>
          
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout