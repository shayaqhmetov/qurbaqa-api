export const failedToConnectToKeycloak = (reason: string) =>
  `Failed to connect to Keycloak server: ${reason}`;
export const keycloakUserAlreadyExists = 'User already exists in Keycloak';
export const keycloakInvalidCredentials = 'Invalid Keycloak credentials';