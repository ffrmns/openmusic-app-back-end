const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema, PostCoverInAlbumHeadersSchema } = require('./schema');

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePostCoverInAlbumHeaders: (headers) => {
    const validationResult = PostCoverInAlbumHeadersSchema.validate(headers);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumsValidator;
