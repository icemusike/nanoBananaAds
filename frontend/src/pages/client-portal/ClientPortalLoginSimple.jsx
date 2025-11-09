export default function ClientPortalLoginSimple() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0e1a', color: 'white', padding: '20px' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
          Client Portal - Test
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '30px', opacity: 0.8 }}>
          If you see this, the route is working!
        </p>
        <div style={{ backgroundColor: '#1a1f2e', padding: '30px', borderRadius: '8px', border: '1px solid #2a2f3e' }}>
          <p>Access Token Test Page</p>
          <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7 }}>
            This is a simplified version to test if the route works.
          </p>
        </div>
      </div>
    </div>
  );
}
