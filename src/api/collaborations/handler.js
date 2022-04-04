const { ClientError } = require('../../exceptions/ClientError');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this.collaborationsService = collaborationsService;
    this.playlistsService = playlistsService;
    this.validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(request, h) {
    try {
      this.validator.validateCollaborationPayload(request.payload);
      const { id: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;
      await this.playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      const collaborationId = await this.collaborationsService.addColaboration(playlistId, userId);
      const response = h.response({
        status: 'success',
        data: {
          collaborationId,
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

  async deleteCollaborationHandler(request, h) {
    try {
      this.validator.validateCollaborationPayload(request.payload);
      const { id: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;
      await this.playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      await this.collaborationsService.deleteCollaboration(playlistId, userId);
      return {
        status: 'success',
        message: 'Berhasil menghapus kolaborasi',
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
        message: 'Maaf, ini bukan kesalahan Anda. Kesalahan ada pada server kami',
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = CollaborationsHandler;
