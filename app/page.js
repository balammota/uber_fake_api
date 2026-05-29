export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem", maxWidth: 640 }}>
      <h1>Uber Fake API</h1>
      <p>API simulada de Uber Eats OAuth 2.0 para práctica de integración.</p>
      <ul>
        <li>
          <code>POST /api/oauth/token</code>
        </li>
        <li>
          <code>GET /api/eats/stores</code>
        </li>
        <li>
          <code>GET /api/eats/stores/:store_id</code>
        </li>
        <li>
          <code>POST /api/eats/stores/:store_id/orders</code>
        </li>
      </ul>
    </main>
  );
}
