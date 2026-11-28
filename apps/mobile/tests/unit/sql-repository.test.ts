import { createDocument, type GraphicDocument } from '@/engine/documents';
import { addLayer, createShapeLayer } from '@/engine/layers';
import { serializeDocument } from '@/engine/project';
import { SCHEMA_VERSION, createSqlProjectRepository, createSqlStores, migrateSchema } from '@/services/projects/sqlRepository';

import { openSqlJs } from '../helpers/sqljs';

const doc = (id: string, updatedAt: number, name = id): GraphicDocument => {
  const d = createDocument({ width: 800, height: 600, background: 'white', name }, { id, now: updatedAt });
  return addLayer(d, createShapeLayer(d, 'rectangle', `${id}_r`, '#112233'));
};

describe('projets dans SQLite', () => {
  it('crée le schéma, enregistre, relit du plus récent au plus ancien, met à jour et supprime', async () => {
    const { db, raw } = await openSqlJs();
    const repo = createSqlProjectRepository(async () => db);
    await repo.save(doc('a', 1000));
    await repo.save(doc('b', 3000));
    await repo.save({ ...doc('a', 5000), name: 'A renommé' });
    expect(raw.exec('PRAGMA user_version')[0]?.values[0]?.[0]).toBe(SCHEMA_VERSION);

    const loaded = await repo.loadAll();
    expect(loaded.documents.map((d) => [d.id, d.name])).toEqual([
      ['a', 'A renommé'],
      ['b', 'b'],
    ]);
    expect(loaded.documents[0]?.layers[0]).toMatchObject({ id: 'a_r', fill: '#112233' });
    expect(raw.exec('SELECT COUNT(*) FROM projects')[0]?.values[0]?.[0]).toBe(2);

    await repo.remove('a');
    expect((await repo.loadAll()).documents.map((d) => d.id)).toEqual(['b']);
  });

  it('retrouve les projets après un redémarrage (base rouverte depuis ses octets)', async () => {
    const first = await openSqlJs();
    await createSqlProjectRepository(async () => first.db).save(doc('x', 10));
    const bytes = first.raw.export();
    const second = await openSqlJs(bytes);
    const loaded = await createSqlProjectRepository(async () => second.db).loadAll();
    expect(loaded.documents.map((d) => d.id)).toEqual(['x']);
  });

  it('signale un projet illisible sans le supprimer ni bloquer les autres', async () => {
    const { db, raw } = await openSqlJs();
    const repo = createSqlProjectRepository(async () => db);
    await repo.save(doc('ok', 2));
    raw.run('INSERT INTO projects VALUES (?, ?, 1, 1, 0, 1, 1, ?)', ['bad', 'Abîmé', '{"kind":"zentech-design/project","formatVersion":1,"document":{"id":"bad"}}']);
    raw.run('INSERT INTO projects VALUES (?, ?, 1, 1, 0, 0, 9, ?)', ['future', 'Futur', JSON.stringify({ kind: 'zentech-design/project', formatVersion: 9, document: {} })]);
    const loaded = await repo.loadAll();
    expect(loaded.documents.map((d) => d.id)).toEqual(['ok']);
    expect(loaded.unreadable.map((u) => u.name)).toEqual(['Abîmé', 'Futur']);
    expect(raw.exec('SELECT COUNT(*) FROM projects')[0]?.values[0]?.[0]).toBe(3);
  });

  it('refuse une base d’une version plus récente ; une migration ratée est annulée', async () => {
    const { db, raw } = await openSqlJs();
    raw.run('PRAGMA user_version = 99');
    await expect(migrateSchema(db)).rejects.toThrow('version plus récente');

    const other = await openSqlJs();
    other.raw.run('CREATE TABLE projects (id TEXT)'); // conflit : l'index de la migration échoue
    await expect(migrateSchema(other.db)).rejects.toThrow();
    expect(other.raw.exec('PRAGMA user_version')[0]?.values[0]?.[0]).toBe(0);
  });

  it('un échec d’ouverture n’est pas définitif (« Réessayer » rouvre la base)', async () => {
    const { db } = await openSqlJs();
    let attempts = 0;
    const repo = createSqlProjectRepository(async () => {
      attempts += 1;
      if (attempts === 1) throw new Error('disque indisponible');
      return db;
    });
    await expect(repo.loadAll()).rejects.toThrow('disque indisponible');
    await expect(repo.loadAll()).resolves.toMatchObject({ documents: [] });
  });

  it('migre une base de la version 1 et conserve ses projets ; réglages lus et écrits', async () => {
    const { db, raw } = await openSqlJs();
    raw.exec(`CREATE TABLE projects (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, format_version INTEGER NOT NULL, data TEXT NOT NULL);
      CREATE INDEX projects_updated_at ON projects (updated_at DESC); PRAGMA user_version = 1;`);
    raw.run('INSERT INTO projects VALUES (?, ?, 800, 600, 0, 9, 2, ?)', ['old', 'Ancien', serializeDocument(doc('old', 9))]);
    const stores = createSqlStores(async () => db);
    expect((await stores.projects.loadAll()).documents.map((d) => d.id)).toEqual(['old']);
    expect(raw.exec('PRAGMA user_version')[0]?.values[0]?.[0]).toBe(2);
    expect(await stores.settings.get('presets')).toBeNull();
    await stores.settings.set('presets', '[1]');
    await stores.settings.set('presets', '[2]');
    expect(await stores.settings.get('presets')).toBe('[2]');
  });

  it('le contenu enregistré est le format versionné', async () => {
    const { db, raw } = await openSqlJs();
    const d = doc('v', 1);
    await createSqlProjectRepository(async () => db).save(d);
    expect(raw.exec('SELECT data, format_version FROM projects')[0]?.values[0]).toEqual([serializeDocument(d), 2]);
  });
});
