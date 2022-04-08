exports.up = (pgm) => {
  pgm.sql("INSERT INTO users(id, username, password, fullname) VALUES ('no_user', 'no_user', 'no_user', 'no_user')");
  pgm.sql("UPDATE playlists SET owner = 'no_user' WHERE owner = NULL");
  pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlists', 'fk_playlists.owner_users.id');
  pgm.sql("UPDATE playlists SET owner = NULL WHERE owner = 'no_user'");
  pgm.sql("DELETE FROM users WHERE id = 'no_user'");
};
