exports.up = (pgm) => {
  pgm.addColumn('albums', {
    cover: {
      type: 'VARCHAR(512)',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('albums', 'cover');
};
