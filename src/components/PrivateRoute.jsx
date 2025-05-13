import { userAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({children}) => {
  const {session} = userAuth();

    if (session === undefined) {
        return (
          <div className="flex items-center justify-center h-screen bg-gradient-to-b">
          <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-xl font-medium text-neutral-200">Loading...</p>
          </div>
          </div>
        );
    }

  return <>{session ? <>{children}</> : <Navigate to='/signin'/>} </>
}

export default PrivateRoute