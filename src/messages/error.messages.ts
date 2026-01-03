export const moduleAccessDenied = (module: string) =>
  `You don't have access to the ${module} module. Please attach it first.`;
export const failedToConnectToKeycloak = (reason: string) =>
  `Failed to connect to Keycloak server: ${reason}`;
export const keycloakUserAlreadyExists = 'User already exists in Keycloak';
export const keycloakInvalidCredentials = 'Invalid Keycloak credentials';

export const serverError = 'An internal server error occurred';

export const MODULES_MESSAGES = {
  MODULE_NOT_FOUND: (moduleId: string) => `Module ${moduleId} not found`,
  MODULE_NOT_ATTACHED: (moduleId: string) => `Module ${moduleId} not attached`,
  USER_NOT_FOUND: (userId: string) => `User with id ${userId} not found`,
  MODULE_TYPE_EXISTS: (moduleType: string) =>
    `Module of type ${moduleType} already exists`,
};

export const CURRENCY_MESSAGE = {
  CURRENCY_NOT_FOUND: (currencyId: string) =>
    `Currency with id ${currencyId} not found`,
};
