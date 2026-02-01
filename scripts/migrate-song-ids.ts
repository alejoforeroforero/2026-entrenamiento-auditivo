import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(connectionString);

async function main() {
  console.log('🔄 Starting song ID migration...\n');

  // Get all songs
  const songs = await sql`SELECT id, title, artist, "startTime" FROM songs`;

  console.log(`Found ${songs.length} songs:\n`);

  const toMigrate = [];

  for (const song of songs) {
    const startTime = song.startTime || 0;
    const expectedSuffix = startTime > 0 ? `-${startTime}` : '';
    const currentHasSuffix = song.id.match(/-\d+$/);

    // Check if ID needs migration (has startTime > 0 but ID doesn't end with it)
    if (startTime > 0 && !song.id.endsWith(`-${startTime}`)) {
      const newId = `${song.id}-${startTime}`;
      toMigrate.push({ ...song, newId, startTime });
      console.log(`  - "${song.id}" → "${newId}" (startTime: ${startTime})`);
    } else {
      console.log(`  ✓ "${song.id}" (startTime: ${startTime}) - OK`);
    }
  }

  if (toMigrate.length === 0) {
    console.log('\n✅ All song IDs are already correct. Nothing to migrate.');
    return;
  }

  console.log(`\nMigrating ${toMigrate.length} songs...\n`);

  for (const song of toMigrate) {
    const oldId = song.id;
    const newId = song.newId;

    console.log(`📦 Migrating: "${oldId}" → "${newId}"`);

    // Update favorites to point to new song ID
    await sql`UPDATE favorites SET "songId" = ${newId} WHERE "songId" = ${oldId}`;
    console.log(`  ✓ Updated favorites`);

    // Update quiz_questions to point to new song ID
    await sql`UPDATE quiz_questions SET "songId" = ${newId} WHERE "songId" = ${oldId}`;
    console.log(`  ✓ Updated quiz questions`);

    // Update the song ID itself
    await sql`UPDATE songs SET id = ${newId} WHERE id = ${oldId}`;
    console.log(`  ✓ Updated song ID`);
  }

  console.log('\n✅ Migration complete!');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  });
