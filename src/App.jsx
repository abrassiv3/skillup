import './index.css'
import NavBar from './components/NavBar';

function App() {

  return (
    <div className="flex flex-col">
      <NavBar />
      <div className='hero-section flex flex-col items-center'>

        <div className='flex flex-col items-center p-2.5 w-2/3 gap-3'>
          <p className='go-to-jobs-title text-center text-8xl tracking-tighter text-balance'>Your Next <span className='go-to-jobs-opportunity'>Opportunity</span> Awaits!</p>
          <p className='go-to-jobs-description text-center text-balance'>Skillup connects clients with <span className='go-to-jobs-opportunity capitalize'>top-tier freelancers</span> and bring your projects to life with ease. Whether you're looking for talent or seeking new opportunities, our platform bridges the gap — <span className='go-to-jobs-opportunity capitalize'>fast, simple & reliable.</span></p>
        </div>

        <div>
          
        </div>

      </div>
    </div>
  )
}

export default App