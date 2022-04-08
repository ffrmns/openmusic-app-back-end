const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationService) {
    this.pool = new Pool();
    this.collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await this.pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan playlist.');
    }
    return result.rows[0].id;
  }

  async getPlaylists(accessor) {
    let query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists INNER JOIN users ON playlists.owner = users.id WHERE playlists.owner = $1',
      values: [accessor],
    };
    let result = await this.pool.query(query);
    if (!result.rows.length) {
      query = {
        text: 'SELECT playlists.id, playlists.name, users.username FROM playlists INNER JOIN collaborations ON playlists.id = collaborations.playlist_id INNER JOIN users ON users.id = playlists.owner WHERE collaborations.user_id = $1',
        values: [accessor],
      };
      result = await this.pool.query(query);
    }
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Tidak ada yang dihapus, id tidak ditemukan.');
    }
  }

  async addSongToPlaylist(playlistId, { songId }) {
    await this.verifySongExistence(songId);
    const id = nanoid(16);
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Gagal menambahkan lagu ke dalam playlist.');
    }
  }

  async getSongsInPlaylist(id) {
    const playlistQuery = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists INNER JOIN users ON playlists.owner = users.id WHERE playlists.id = $1',
      values: [id],
    };
    const playlistQueryResult = await this.pool.query(playlistQuery);
    const playlistRows = playlistQueryResult.rows[0];
    if (playlistRows.id) {
      const songsInPlaylistQuery = {
        text: 'SELECT songs.id, songs.title, songs.performer FROM songs INNER JOIN playlist_songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1',
        values: [id],
      };
      const songsInPlaylistQueryResult = await this.pool.query(songsInPlaylistQuery);
      playlistRows.songs = songsInPlaylistQueryResult.rows;
    }
    return playlistRows;
  }

  async deleteSongInPlaylist(playlistId, { songId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Tidak ada yang dihapus, id tidak ditemukan.');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);
    const playlist = result.rows[0];
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Maaf, Anda tidak berhak mengakses, bukan pemilik playlist ini.');
    }
  }

  async verifySongExistence(songId) {
    const songsQuery = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };
    const songsResult = await this.pool.query(songsQuery);
    if (!songsResult.rows.length) throw new NotFoundError('Tidak dapat dimasukkan, lagu tidak ada.');
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this.collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addPlaylistActivity(playlistId, songId, userId, action) {
    const id = nanoid(16);
    const time = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };
    const result = await this.pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Aktivitas gagal dimasukkan.');
    }
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: 'SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time FROM playlist_song_activities INNER JOIN users ON playlist_song_activities.user_id = users.id INNER JOIN songs ON playlist_song_activities.song_id = songs.id WHERE playlist_song_activities.playlist_id = $1 ORDER BY playlist_song_activities.time',
      values: [playlistId],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistsService;
