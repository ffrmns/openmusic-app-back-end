/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql("INSERT INTO songs(id, title, year, performer, genre, album_id) VALUES('no_song', 'no_song', 0, 'no_song', 'no_song', 'no_album')");
  pgm.sql("UPDATE playlist_songs SET song_id = 'no_song' WHERE  song_id = NULL");
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id');
  pgm.sql("UPDATE playlist_songs SET song_id = NULL WHERE song_id = 'no_song'");
  pgm.sql("DELETE FROM songs WHERE id = 'no_song'");
};
