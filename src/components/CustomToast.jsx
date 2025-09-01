import { useState, useEffect, createContext, useContext } from 'react';

// Toast Context
const ToastContext = createContext();

// Toast Provider Component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message, duration) => addToast(message, 'success', duration);
  const error = (message, duration) => addToast(message, 'error', duration);
  const loading = (message, duration) => addToast(message, 'loading', duration);
  const dismiss = (id) => removeToast(id);

  const toast = { success, error, loading, dismiss };

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Toast Container Component
function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '400px'
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            background: getToastStyle(toast.type).background,
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            border: getToastStyle(toast.type).border,
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: '300px',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              marginLeft: '10px',
              opacity: 0.7
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// Toast Style Helper
function getToastStyle(type) {
  switch (type) {
    case 'success':
      return {
        background: 'linear-gradient(135deg, #10b981, #059669)',
        border: '1px solid #34d399'
      };
    case 'error':
      return {
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        border: '1px solid #f87171'
      };
    case 'loading':
      return {
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        border: '1px solid #60a5fa'
      };
    default:
      return {
        background: '#363636',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      };
  }
}

// Custom Hook for using toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
