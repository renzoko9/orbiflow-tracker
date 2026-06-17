import 'reflect-metadata';
import { existsSync, readFileSync } from 'fs';
import { join, extname } from 'path';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../config/data-source';
import { StorageService } from '../common/providers/storage/storage.service';
import { User, Transaction, ChatMessage } from '@Entities';

const UPLOADS_PREFIX = '/uploads/';

function contentTypeFor(key: string): string {
  switch (extname(key).toLowerCase()) {
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}

async function main() {
  const storage = new StorageService(new ConfigService());
  storage.onModuleInit();

  const ds = new DataSource(dataSourceOptions);
  await ds.initialize();

  let migrated = 0;
  let missing = 0;

  // sube /uploads/... y devuelve la key nueva, o null si no hay que tocarlo
  async function migrateValue(value: string): Promise<string | null> {
    if (!value || !value.startsWith(UPLOADS_PREFIX)) return null;
    const key = value.slice(UPLOADS_PREFIX.length);
    const diskPath = join(process.cwd(), value);
    if (!existsSync(diskPath)) {
      console.warn(`FALTA en disco, se omite: ${value}`);
      missing++;
      return null;
    }
    await storage.upload(key, readFileSync(diskPath), contentTypeFor(key));
    migrated++;
    return key;
  }

  // 1) Avatares
  const userRepo = ds.getRepository(User);
  const users = await userRepo
    .createQueryBuilder('u')
    .where('u.avatarUrl LIKE :p', { p: `${UPLOADS_PREFIX}%` })
    .getMany();
  for (const u of users) {
    const key = await migrateValue(u.avatarUrl!);
    if (key) {
      u.avatarUrl = key;
      await userRepo.save(u);
    }
  }

  // 2) Fotos de transacciones (text[])
  const txRepo = ds.getRepository(Transaction);
  const txs = await txRepo
    .createQueryBuilder('t')
    .where(`array_to_string(t.photos, ',') LIKE :p`, {
      p: `%${UPLOADS_PREFIX}%`,
    })
    .getMany();
  for (const t of txs) {
    let changed = false;
    const next: string[] = [];
    for (const photo of t.photos ?? []) {
      const key = await migrateValue(photo);
      if (key) {
        next.push(key);
        changed = true;
      } else {
        next.push(photo);
      }
    }
    if (changed) {
      t.photos = next;
      await txRepo.save(t);
    }
  }

  // 3) Chat: image_url + payload.photos
  const chatRepo = ds.getRepository(ChatMessage);
  const msgs = await chatRepo.find();
  for (const m of msgs) {
    let changed = false;
    if (m.imageUrl) {
      const key = await migrateValue(m.imageUrl);
      if (key) {
        m.imageUrl = key;
        changed = true;
      }
    }
    const payload = m.payload as { photos?: string[] } | null;
    if (payload && Array.isArray(payload.photos)) {
      const next: string[] = [];
      let pChanged = false;
      for (const photo of payload.photos) {
        const key = await migrateValue(photo);
        if (key) {
          next.push(key);
          pChanged = true;
        } else {
          next.push(photo);
        }
      }
      if (pChanged) {
        m.payload = { ...payload, photos: next };
        changed = true;
      }
    }
    if (changed) await chatRepo.save(m);
  }

  console.log(`Listo. Migrados: ${migrated}. Faltantes en disco: ${missing}.`);
  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
