import RequestService from '@/request.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as ErrorMessages from '../messages/error.messages';
import { KeycloakSignUpDTO } from './dtos/keycloak.dto';

export class KeycloakCredentialDTO {
  identifier: string;
  password: string;
}

@Injectable()
export class KeycloakAdminService {
  private token: string;
  private tokenExpiry: number;
  private readonly logger = new Logger(KeycloakAdminService.name);
  private readonly requestService: RequestService;
  constructor(private readonly configService: ConfigService) {
    this.token = null;
    this.tokenExpiry = 0;
    this.requestService = new RequestService({
      baseURL: this.configService.get('authenticationServerUrl'),
    });
  }

  protected async getAdminToken(): Promise<string> {
    let response = null;
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }
    try {
      response = await this.requestService.post(
        `/realms/${this.configService.get('realmName')}/protocol/openid-connect/token`,
        new URLSearchParams({
          client_id: this.configService.get('clientId'),
          client_secret: this.configService.get('clientSecret'),
          grant_type: 'client_credentials',
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      response.data = JSON.parse(response.data);

      this.token = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
    } catch (err) {
      throw new BadRequestException(
        ErrorMessages.failedToConnectToKeycloak(err.message as string),
      );
    }
    if (response.data.error) {
      this.logger.error('Failed to obtain admin token from Keycloak');
      this.logger.error(JSON.parse(response.data).error_description);
      throw new BadRequestException(
        ErrorMessages.failedToConnectToKeycloak(
          JSON.parse(response.data).error_description,
        ),
      );
    }
    return response.data.access_token;
  }

  async createUser(userData: KeycloakSignUpDTO): Promise<{ id: string }> {
    try {
      const adminToken = await this.getAdminToken();
      const payload = {
        username: userData.username,
        email: userData.email,
        enabled: true,
        firstName: userData.firstName,
        lastName: userData.lastName,
        credentials: [
          {
            type: 'password',
            value: userData.password,
            temporary: false,
          },
        ],
      };
      const a = JSON.parse(
        Buffer.from(adminToken.split('.')[1], 'base64').toString(),
      );
      console.log(a.realm_access, a.resource_access);
      const response = await this.requestService.post(
        `/admin/realms/${this.configService.get('realmName')}/users`,
        JSON.stringify(payload),
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const responseData = response.data == '' ? {} : JSON.parse(response.data);
      if (responseData.error || responseData.errorMessage) {
        this.logger.error(
          'Error creating user in Keycloak:',
          responseData.errorMessage,
        );
        throw new InternalServerErrorException(responseData.errorMessage);
      }

      const locationHeader = response.headers['location'];
      let userId = '';
      if (locationHeader) {
        userId = locationHeader.split('/').pop();
      }
      this.logger.log('User created successfully');
      return { id: userId };
    } catch (error) {
      if (error.errorMessage) {
        this.logger.error(
          'Error creating user in Keycloak:',
          error.errorMessage,
        );
        throw new InternalServerErrorException(error.errorMessage);
      }
      if (error.response && error.response.status === 409) {
        this.logger.error('User already exists in keycloak');
        throw new BadRequestException(ErrorMessages.keycloakUserAlreadyExists);
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async login(
    credentials: KeycloakCredentialDTO,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const response = await this.requestService.post(
      `${this.configService.get('authenticationServerUrl')}/realms/${this.configService.get('realmName')}/protocol/openid-connect/token`,
      new URLSearchParams({
        client_id: this.configService.get('clientId'),
        client_secret: this.configService.get('clientSecret'),
        grant_type: 'password',
        username: credentials.identifier,
        password: credentials.password,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    const responseData = JSON.parse(response.data);
    if (responseData.error) {
      this.logger.error(
        'Keycloak login error:',
        responseData.error_description,
      );
      throw new UnauthorizedException(responseData.error_description);
    }

    this.logger.log('User successfully signed in!');
    return {
      access_token: responseData.access_token,
      refresh_token: responseData.refresh_token,
    };
  }

  // async exchangeMicrosoftTokenForKeycloak(
  //   microsoftToken: string,
  // ): Promise<TokenResponse> {
  //   try {
  //     const keycloakUrl = `${this.configService.get("app.authenticationServerUrl")}/realms/${KEYCLOAK_REALM_NAME}/protocol/openid-connect/token`;
  //     const params = new URLSearchParams();
  //     params.append("client_id", KEYCLOAK_CLIENT_ID);
  //     params.append("client_secret", KEYCLOAK_CLIENT_SECRET);
  //     params.append(
  //       "grant_type",
  //       "urn:ietf:params:oauth:grant-type:token-exchange",
  //     );
  //     params.append("subject_token", microsoftToken);
  //     params.append(
  //       "subject_token_type",
  //       "urn:ietf:params:oauth:token-type:access_token",
  //     );
  //     params.append("subject_issuer", "microsoft");
  //     params.append(
  //       "requested_token_type",
  //       "urn:ietf:params:oauth:token-type:refresh_token",
  //     );

  //     const { data } = await AxiosService.getAxiosInstance().post(
  //       keycloakUrl,
  //       params,
  //       {
  //         headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //       },
  //     );

  //     return {
  //       access_token: data.access_token,
  //       refresh_token: data.refresh_token,
  //     };
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // async refreshToken(refresh_token: string): Promise<TokenResponse> {
  //   try {
  //     const response = await AxiosService.getAxiosInstance().post(
  //       `${this.configService.get("app.authenticationServerUrl")}/realms/${KEYCLOAK_REALM_NAME}/protocol/openid-connect/token`,
  //       new URLSearchParams({
  //         client_id: KEYCLOAK_CLIENT_ID,
  //         client_secret: KEYCLOAK_CLIENT_SECRET,
  //         grant_type: "refresh_token",
  //         refresh_token: refresh_token,
  //       }).toString(),
  //       {
  //         headers: {
  //           "Content-Type": "application/x-www-form-urlencoded",
  //         },
  //       },
  //     );
  //     return {
  //       access_token: response.data.access_token,
  //       refresh_token: response.data.refresh_token,
  //     };
  //   } catch {
  //     throw new UnauthorizedException(ErrorMessages.refreshTokenExpired);
  //   }
  // }

  // async createResource(resource: KeycloakResource): Promise<void> {
  //   const adminToken = await this.getAdminToken();
  //   try {
  //     const response = await AxiosService.getAxiosInstance().post(
  //       `${this.configService.get("app.authenticationServerUrl")}/admin/realms/${KEYCLOAK_REALM_NAME}/clients/${KEYCLOAK_CLIENT_UUID}/authz/resource-server/resource`,
  //       resource,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${adminToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       },
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.log(error);
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }
  // async createGroup(group: KeycloakGroup): Promise<{ id: string }> {
  //   const adminToken = await this.getAdminToken();
  //   try {
  //     const response = await AxiosService.getAxiosInstance().post(
  //       `${this.configService.get("app.authenticationServerUrl")}/admin/realms/${KEYCLOAK_REALM_NAME}/groups`,
  //       group,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${adminToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       },
  //     );
  //     const locationHeader = response.headers["location"];
  //     let groupId = "";
  //     if (locationHeader) {
  //       groupId = locationHeader.split("/").pop();
  //     }

  //     return { id: groupId };
  //   } catch (error) {
  //     console.log(error);
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // async assignUserToGroup(userId: string, groupId: string): Promise<void> {
  //   const adminToken = await this.getAdminToken();
  //   try {
  //     const response = await AxiosService.getAxiosInstance().put(
  //       `${this.configService.get("app.authenticationServerUrl")}/admin/realms/${KEYCLOAK_REALM_NAME}/users/${userId}/groups/${groupId}`,
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer ${adminToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       },
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.log(error);
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // async createGroupPolicy(policy: KeycloakGroupPolicy): Promise<void> {
  //   const adminToken = await this.getAdminToken();
  //   try {
  //     const response = await AxiosService.getAxiosInstance().post(
  //       `${this.configService.get("app.authenticationServerUrl")}/admin/realms/${KEYCLOAK_REALM_NAME}/clients/${KEYCLOAK_CLIENT_UUID}/authz/resource-server/policy/group`,
  //       policy,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${adminToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       },
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.log(error);
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // async createCompanyAdmin(userId: string): Promise<void> {
  //   const adminToken = await this.getAdminToken();
  //   try {
  //     const response = await AxiosService.getAxiosInstance().post(
  //       `${this.configService.get("app.authenticationServerUrl")}/admin/realms/${KEYCLOAK_REALM_NAME}/users/${userId}/role-mappings/realm`,
  //       [
  //         {
  //           id: COMPANY_ADMIN_ID,
  //           name: COMPANY_ADMIN_NAME,
  //         },
  //       ],
  //       {
  //         headers: {
  //           Authorization: `Bearer ${adminToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       },
  //     );
  //     return response.data;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }
  // async removeUserFromGroup(uuid: string, userId: string): Promise<void> {
  //   const adminToken = await this.getAdminToken();
  //   try {
  //     await AxiosService.getAxiosInstance().delete(
  //       `${this.configService.get("app.authenticationServerUrl")}/admin/realms/${KEYCLOAK_REALM_NAME}/users/${userId}/groups/${uuid}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${adminToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       },
  //     );
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // async createUserFromMicrosoft(
  //   userData: Omit<KeycloakSignUpDTO, "password" | "repeat_password">,
  // ): Promise<{ id: string }> {
  //   try {
  //     const adminToken = await this.getAdminToken();

  //     const response = await AxiosService.getAxiosInstance().post(
  //       `${this.configService.get("app.authenticationServerUrl")}/admin/realms/${KEYCLOAK_REALM_NAME}/users`,
  //       {
  //         username: userData.username,
  //         email: userData.email,
  //         enabled: true,
  //         firstName: userData.firstName,
  //         lastName: userData.lastName,
  //         emailVerified: true,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${adminToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       },
  //     );
  //     const locationHeader = response.headers["location"];
  //     let userId = "";
  //     if (locationHeader) {
  //       userId = locationHeader.split("/").pop();
  //     }
  //     this.logger.log("User created successfully");
  //     return { id: userId };
  //   } catch (error) {
  //     if (error.response && error.response.status === 409) {
  //       this.logger.error("User already exists in keycloak");
  //       throw new BadRequestException(ErrorMessages.keycloakUserAlreadyExists);
  //     }
  //     this.logger.error(error.message);
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // async hasMicrosoftIdp(userId: string): Promise<boolean> {
  //   const adminToken = await this.getAdminToken();
  //   try {
  //     const response = await AxiosService.getAxiosInstance().get<KeycloakIdp[]>(
  //       `${this.configService.get("app.authenticationServerUrl")}/admin/realms/${KEYCLOAK_REALM_NAME}/users/${userId}/federated-identity`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${adminToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       },
  //     );
  //     return response.data.some(e => e.identityProvider === "microsoft");
  //   } catch (error) {
  //     console.log(error);
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // async linkIdentityProvider(params: {
  //   keycloakUserId: string;
  //   idpAlias: string;
  //   externalUserId: string;
  //   externalUserName?: string;
  // }): Promise<void> {
  //   const { keycloakUserId, idpAlias, externalUserId, externalUserName } =
  //     params;
  //   const adminToken = await this.getAdminToken();
  //   try {
  //     await AxiosService.getAxiosInstance().post(
  //       `${this.configService.get("app.authenticationServerUrl")}/admin/realms/${KEYCLOAK_REALM_NAME}/users/${keycloakUserId}/federated-identity/${idpAlias}`,
  //       {
  //         userId: externalUserId,
  //         userName: externalUserName || externalUserId,
  //         identityProvider: idpAlias,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${adminToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       },
  //     );
  //   } catch (error) {
  //     console.log(error);
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }
}
