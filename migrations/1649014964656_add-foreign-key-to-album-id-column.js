exports.up = (pgm) => {
  pgm.sql("INSERT INTO albums(id, name, year) VALUES('no_album', 'no_album', 0)");
  pgm.sql("UPDATE songs SET album_id = 'no_album' WHERE album_id = NULL");
  pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id');
  pgm.sql("UPDATE songs SET album_id = NULL WHERE album_id = 'no_album'");
  pgm.sql("DELETE FROM albums WHERE id = 'no_album'");
};
