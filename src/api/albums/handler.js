class AlbumsHandler {
  constructor(albumsService, storageService, validator) {
    this.albumsService = albumsService;
    this.storageService = storageService;
    this.validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postCoverInAlbumHandler = this.postCoverInAlbumHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this.albumsService.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this.albumsService.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this.validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this.albumsService.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album yang dipilih berhasil diperbarui.',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this.albumsService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus dari daftar.',
    };
  }

  async postCoverInAlbumHandler({ payload, params }, h) {
    const { cover } = payload;
    const { hapi } = cover;
    const { headers } = hapi;
    this.validator.validatePostCoverInAlbumHeaders(headers);
    const filename = await this.storageService.writeFile(cover, hapi);

    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/albums/images/${filename}`;

    const { id } = params;
    await this.albumsService.postCoverInAlbum(id, fileLocation);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = AlbumsHandler;
