const Joi = require('joi');

const ExportSongsInPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = ExportSongsInPlaylistPayloadSchema;
