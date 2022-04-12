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

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this.service.verifyPlaylistOwner(id, credentialId);
    await this.service.deletePlaylistById(id);
    return {
      status: 'success',
      message: 'Berhasil menghapus playlist.',
    };
  }

  async postSongInPlaylistHandler(request, h) {
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
  }

  async getSongsInPlaylistIdHandler(request) {
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
  }

  async deleteSongInPlaylistIdHandler(request) {
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
  }

  async getActivitiesInPlaylistHandler(request) {
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
  }
}

module.exports = PlaylistsHandler;
