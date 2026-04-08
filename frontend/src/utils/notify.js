import { toast } from 'react-hot-toast';

/**
 * Premium Notification Utility 
 * Centralizes all toast calls to ensure consistent styling and easy migration.
 */
const notify = {
  success: (message, options = {}) => {
    return toast.success(message, {
      ...options,
      className: 'premium-toast success',
    });
  },
  
  error: (message, options = {}) => {
    return toast.error(message, {
      ...options,
      className: 'premium-toast error',
      duration: 5000,
    });
  },
  
  warning: (message, options = {}) => {
    return toast(message, {
      ...options,
      icon: '⚠️',
      className: 'premium-toast warning',
    });
  },
  
  info: (message, options = {}) => {
    return toast(message, {
      ...options,
      icon: 'ℹ️',
      className: 'premium-toast info',
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...options,
      className: 'premium-toast loading',
    });
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  }
};

export default notify;
