const ClientError = require('../../exceptions/ClientError');

class PlaylistsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongInPlaylistHandler = this.postSongInPlaylistHandler.bind(this);
    this.getSongsInPlaylistIdHandler = this.getSongsInPlaylistIdHandler.bind(this);
    this.deleteSongInPlaylistIdHandler = this.deleteSongInPlaylistIdHandler.bind(this);
    this.getActivitiesInPlaylistHandler = this.getActivitiesInPlaylistHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this.validator.validatePostPlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      const playlistId = await this.service.addPlaylist({ name, owner: credentialId });
      const response = h.response({
        status: 'success',
        data: {
          playlistId,
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

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this.service.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      await this.service.verifyPlaylistOwner(id, credentialId);
      await this.service.deletePlaylistById(id);
      return {
        status: 'success',
        message: 'Berhasil menghapus playlist.',
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
      response.code(error.statusCode);
      return response;
    }
  }

  async postSongInPlaylistHandler(request, h) {
    try {
      this.validator.validatePostSongInPlaylistPayload(request.payload);
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      await this.service.verifyPlaylistAccess(id, credentialId);
      const { songId } = request.payload;
      await this.service.addSongToPlaylist(id, { songId });
      await this.service.addPlaylistActivity(id, songId, credentialId, 'add');
      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke dalam playlist.',
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

  async getSongsInPlaylistIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      await this.service.verifyPlaylistAccess(id, credentialId);
      const playlist = await this.service.getSongsInPlaylist(id);
      return {
        status: 'success',
        data: {
          playlist,
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

  async deleteSongInPlaylistIdHandler(request, h) {
    try {
      this.validator.validateDeleteSongInPlaylistPayload(request.payload);
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      await this.service.verifyPlaylistAccess(id, credentialId);
      const { songId } = request.payload;
      await this.service.deleteSongInPlaylist(id, { songId });
      await this.service.addPlaylistActivity(id, songId, credentialId, 'delete');
      return {
        status: 'success',
        message: 'Semua lagu di playlist telah dihapus.',
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
        status: 'fail',
        message: 'Maaf, ini bukan kesalahan Anda. Kesalahan ada pada server kami.',
      });
      response.code(500);
      return response;
    }
  }

  async getActivitiesInPlaylistHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      await this.service.verifyPlaylistAccess(id, credentialId);
      const activities = await this.service.getPlaylistActivities(id);
      return {
        status: 'success',
        data: {
          playlistId: id,
          activities,
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
        message: error.message,
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = PlaylistsHandler;
