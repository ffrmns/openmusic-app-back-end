class ExportsHandler {
  constructor(playlistsService, ProducerService, validator) {
    this.playlistsService = playlistsService;
    this.ProducerService = ProducerService;
    this.validator = validator;

    this.postExportSongsInPlaylistHandler = this.postExportSongsInPlaylistHandler.bind(this);
  }

  async postExportSongsInPlaylistHandler({ auth, payload, params }, h) {
    const { playlistId } = params;
    const { id: userId } = auth.credentials;
    await this.playlistsService.verifyPlaylistOwner(playlistId, userId);
    this.validator.validateExportSongsInPlaylistPayload(payload);

    const message = {
      playlistId,
      targetEmail: payload.targetEmail,
    };
    await this.ProducerService.sendMessage('export:songsInPlaylist', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
