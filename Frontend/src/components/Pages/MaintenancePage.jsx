const MaintenancePage = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#f8f9fa', 
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '2.5rem', color: '#343a40' }}>Under Maintenance</h1>
      <p style={{ fontSize: '1.2rem', color: '#6c757d', marginTop: '10px' }}>
        We&apos;re updating the application with new features. Please check back in a few minutes.
      </p>
      <div style={{ marginTop: '20px' }}>
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM11 6H13V12H16V14H11V6Z" fill="#6c757d"/>
        </svg>
      </div>
    </div>
  );
};

export default MaintenancePage;