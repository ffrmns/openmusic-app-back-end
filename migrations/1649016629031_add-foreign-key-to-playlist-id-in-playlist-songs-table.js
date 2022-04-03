/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql("INSERT INTO playlists(id, name, owner) VALUES('no_playlist', 'no_playlist', 'no_user')");
  pgm.sql("UPDATE playlist_songs SET playlist_id = 'no_playlist' WHERE playlist_id = NULL");
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists.id');
  pgm.sql("UPDATE playlist_songs SET playlist_id = NULL WHERE playlist_id = 'no_playlist'");
  pgm.sql("DELETE FROM playlists WHERE id = 'no_playlist'");
};
