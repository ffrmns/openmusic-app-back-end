const ClientError = require('../../exceptions/ClientError');

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this.authenticationsService = authenticationsService;
    this.usersService = usersService;
    this.tokenManager = tokenManager;
    this.validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    try {
      this.validator.validatePostAuthenticationPayload(request.payload);
      const { username, password } = request.payload;
      const id = this.usersService.verifyUserCredential(username, password);
      const accessToken = this.tokenManager.generateAccessToken({ id });
      const refreshToken = this.tokenManager.generateRefreshToken({ id });
      await this.authenticationsService.addRefreshToken(refreshToken);
      const response = h.response({
        status: 'success',
        data: {
          accessToken,
          refreshToken,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, ini bukan kesalahan Anda. Kesalahan ada pada server kami.',
      });
      response.code(500);
      return response;
    }
  }

  async putAuthenticationHandler(request, h) {
    try {
      this.validator.validatePutAuthenticationPayload(request.payload);
      const { refreshToken } = request.payload;
      await this.authenticationsService.verifyRefreshToken(refreshToken);
      const { id } = this.tokenManager.verifyRefreshToken(refreshToken);
      const accessToken = this.tokenManager.generateAccessToken({ id });
      return {
        status: 'success',
        data: {
          accessToken,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: 'Maaf, ini bukan kesalahan Anda. Kesalahan ada pada server kami.',
      });
      response.code(500);
      return response;
    }
  }

  async deleteAuthenticationHandler(request, h) {
    try {
      this.validator.validateDeleteAuthenticationPayload(request.payload);
      const { refreshToken } = request.payload;
      await this.authenticationsService.verifyRefreshToken(refreshToken);
      await this.authenticationsService.deleteRefreshToken(refreshToken);
      return {
        status: 'success',
        message: 'Refresh token berhasil dihapus.',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, ini bukan kesalahan Anda. Kesalahan ada pada server kami.',
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = AuthenticationsHandler;
