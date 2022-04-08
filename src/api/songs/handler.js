class SongsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler({ payload }, h) {
    this.validator.validateSongPayload(payload);
    const songId = await this.service.addSong(payload);
    const response = h.response({
      status: 'success',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler({ query }) {
    const songs = await this.service.getSongs(query);
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler({ params }) {
    const song = await this.service.getSongById(params.id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler({ payload, params }) {
    this.validator.validateSongPayload(payload);
    await this.service.editSongById(params.id, payload);
    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler({ params }) {
    await this.service.deleteSongById(params.id);
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
