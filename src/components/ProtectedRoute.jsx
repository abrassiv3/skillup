import { userAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({children, allowedRoles}) => {
    const { session, userRole, loading } = userAuth();

    if (loading) {
        return (
          <div className='w-full pb-8'>
            <div className="flex items-center justify-center h-screen bg-gradient-to-b">
            <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="text-xl font-medium text-neutral-200">Loading...</p>
            </div>
            </div>
          </div>
        );
    }

    if (!session) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;