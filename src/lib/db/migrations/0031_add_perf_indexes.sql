-- Audit 2026-07-15: Performance indexes
-- R-1: Index for fileMateri.kategori
CREATE INDEX IF NOT EXISTS file_materi_kategori_idx ON file_materi (kategori);

-- R-4: Index for materiRead.materiPublishedId
CREATE INDEX IF NOT EXISTS materi_read_materi_published_idx ON materi_read (materi_published_id);