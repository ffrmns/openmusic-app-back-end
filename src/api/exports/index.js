const ExportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { playlistsService, ProducerService, validator }) => {
    const exportsHandler = new ExportsHandler(playlistsService, ProducerService, validator);
    server.route(routes(exportsHandler));
  },
};
