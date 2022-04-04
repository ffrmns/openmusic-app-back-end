const Joi = require('joi');

const CollaborationsPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = { CollaborationsPayloadSchema };
