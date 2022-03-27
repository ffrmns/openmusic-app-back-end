const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration, albumId }){
    const id = nanoid(16);
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id){
      throw new InvariantError('Lagu gagal ditambahkan.');
    }
    return result.rows[0].id;
  }

  async getSongs(){
    const result = await this._pool.query('SELECT * FROM songs');
    return result.rows.map(mapDBToModel);
  }

  async getSongById(id){
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length){
      throw new NotFoundError('Lagu tidak ditemukan.');
    }
    return result.rows.map(mapDBToModel)[0];
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId}){
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, albumId = $6 WHERE id = $6 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };
    const result = await this._pool.query(query);
    if(!result.rows.length){
      throw new NotFoundError('Gagal memperbarui lagu, id tidak ditemukan');
    }
  }

  async deleteSongById(id){
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length){
      throw new NotFoundError('Catatan gagal dihapus, id tidak ditemukan.');
    }
  }
}

module.exports = SongsService;
