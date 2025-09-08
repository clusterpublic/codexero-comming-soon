import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function ToastTest() {
  const [testCount, setTestCount] = useState(0);
  const [toastStatus, setToastStatus] = useState('Not tested');

  useEffect(() => {
    // Test if toast is available on mount
    console.log('🔔 ToastTest component mounted');
    console.log('Toast import result:', toast);
    console.log('Toast type:', typeof toast);
    console.log('Toast methods:', Object.keys(toast || {}));
    
    if (typeof toast === 'function') {
      setToastStatus('Toast function available');
    } else if (toast && typeof toast.success === 'function') {
      setToastStatus('Toast object with methods available');
    } else {
      setToastStatus('Toast not properly imported');
    }
  }, []);

  const testToasts = () => {
    setTestCount(prev => prev + 1);
    
    console.log('🔔 Testing toasts...');
    console.log('Toast function type:', typeof toast);
    console.log('Toast object:', toast);
    console.log('Toast methods:', Object.keys(toast || {}));
    
    try {
      // Test different toast methods
      if (toast && typeof toast.success === 'function') {
        toast.success(`🎉 Success toast #${testCount + 1}`);
        console.log('✅ Success toast sent');
      } else {
        console.log('❌ Success toast method not available');
      }
      
      if (toast && typeof toast.error === 'function') {
        toast.error(`❌ Error toast #${testCount + 1}`);
        console.log('✅ Error toast sent');
      } else {
        console.log('❌ Error toast method not available');
      }
      
      if (toast && typeof toast.info === 'function') {
        const loadingToast = toast.info(`🔄 Info toast #${testCount + 1}`, { autoClose: false });
        console.log('✅ Info toast sent');
        
        // Dismiss info toast after 2 seconds
        setTimeout(() => {
          if (toast && typeof toast.dismiss === 'function') {
            toast.dismiss(loadingToast);
            console.log('✅ Info toast dismissed');
          }
        }, 2000);
      } else {
        console.log('❌ Info toast method not available');
      }
      
      console.log('✅ Toast tests completed');
    } catch (error) {
      console.error('❌ Toast test failed:', error);
      setToastStatus(`Error: ${error.message}`);
    }
  };

  const testBrowserNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Test Notification', {
          body: 'This is a test browser notification',
          icon: '/favicon.ico'
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Test Notification', {
              body: 'Permission granted! This is a test notification',
              icon: '/favicon.ico'
            });
          }
        });
      }
    }
  };

  return (
    <div style={{
      padding: '20px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      margin: '20px',
      textAlign: 'center'
    }}>
      <h3>Toast Test Component</h3>
      <p>Toast Status: <strong>{toastStatus}</strong></p>
      <p>Click the button to test toast notifications</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testToasts}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          Test Toasts ({testCount})
        </button>
        
        <button 
          onClick={testBrowserNotification}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Test Browser Notifications
        </button>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Check console for debug info</p>
        <p>Toasts should appear in top-right corner</p>
        <p>If toasts don't work, browser notifications will be used as fallback</p>
      </div>
    </div>
  );
}
