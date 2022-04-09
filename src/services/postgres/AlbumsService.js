const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapAlbumsDBToModel } = require('../../utils');

class AlbumsService {
  constructor(cacheService) {
    this.pool = new Pool();
    this.cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
    const result = await this.pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan.');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan.');
    }
    const mappedResultRows = result.rows.map(mapAlbumsDBToModel);
    const songInAlbumQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };
    const songInAlbumResult = await this.pool.query(songInAlbumQuery);
    mappedResultRows[0].songs = songInAlbumResult.rows;

    return mappedResultRows[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album, id tidak ditemukan.');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus, id tidak ditemukan.');
    }
  }

  async postCoverInAlbum(id, coverAddress) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [coverAddress, id],
    };
    const result = await this.pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Cover gagal ditambahkan.');
    }
  }

  async postLikeInAlbum(albumId, userId) {
    const isLiked = await this.verifyLikeExistence(albumId, userId);
    if (!isLiked) {
      const id = `like-${nanoid(16)}`;
      const query = {
        text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
        values: [id, userId, albumId],
      };
      const result = await this.pool.query(query);
      if (!result.rows.length) {
        throw new InvariantError('Gagal menambah like');
      }
    } else {
      const query = {
        text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
        values: [albumId, userId],
      };
      const result = await this.pool.query(query);
      if (!result.rows.length) {
        throw new InvariantError('Gagal batal like');
      }
    }
    await this.cacheService.delete(`albumLikes:${albumId}`);
  }

  async verifyLikeExistence(albumId, userId) {
    await this.getAlbumById(albumId);
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };
    const result = await this.pool.query(query);
    if (!result.rows.length) {
      return false;
    }
    return true;
  }

  async getLikesInAlbum(albumId) {
    try {
      const result = await this.cacheService.get(`albumLikes:${albumId}`);
      return { count: JSON.parse(result), isCache: true };
    } catch (error) {
      await this.getAlbumById(albumId);
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this.pool.query(query);
      const count = parseInt(result.rows[0].count, 10);
      await this.cacheService.set(`albumLikes:${albumId}`, count);
      return { count, isCache: false };
    }
  }
}

module.exports = AlbumsService;
