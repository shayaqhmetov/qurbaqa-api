export default () => ({
  authenticationServerUrl:
    process.env.KEYCLOAK_AUTH_SERVER_URL || 'http://localhost:8080',
  realmName: process.env.KEYCLOAK_REALM_NAME || 'your-realm',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'your-client-id',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'your-client-secret',
});
