const Joi = require('joi');

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongInPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const DeleteSongInPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  PostPlaylistPayloadSchema,
  PostSongInPlaylistPayloadSchema,
  DeleteSongInPlaylistPayloadSchema,
};
