import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutThunk } from '../store/slices/authSlice';

export const useAuth = () => {
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const logout = () => {
    dispatch(logoutThunk());
  };

  const isAdmin = user?.role === 'admin';
  const isSuperInstructor = user?.role === 'super_instructor';
  const isInstructor = user?.role === 'instructor' || isSuperInstructor;
  const isStudent = user?.role === 'student';

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    logout,
    isAdmin,
    isSuperInstructor,
    isInstructor,
    isStudent,
  };
};
