import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(connectionString);

async function main() {
  console.log('🔄 Starting progression ID migration...\n');

  // Get all progressions
  const progressions = await sql`SELECT * FROM progressions`;

  const toMigrate = progressions.filter((p) => p.id !== p.name);

  if (toMigrate.length === 0) {
    console.log('✅ All progressions already have id === name. Nothing to migrate.');
    return;
  }

  console.log(`Found ${toMigrate.length} progressions to migrate:\n`);

  // Get counts
  for (const p of toMigrate) {
    const [{ count: songCount }] = await sql`SELECT COUNT(*) FROM songs WHERE "progressionId" = ${p.id}`;
    const [{ count: questionCount }] = await sql`SELECT COUNT(*) FROM quiz_questions WHERE "progressionId" = ${p.id}`;
    console.log(`  - "${p.id}" → "${p.name}" (${songCount} songs, ${questionCount} quiz questions)`);
  }
  console.log('');

  for (const oldProgression of toMigrate) {
    const newId = oldProgression.name;
    const oldId = oldProgression.id;

    console.log(`\n📦 Migrating: "${oldId}" → "${newId}"`);

    // Check if a progression with the new ID already exists
    const existing = await sql`SELECT id FROM progressions WHERE id = ${newId}`;

    if (existing.length > 0) {
      console.log(`  ⚠️  Progression with id "${newId}" already exists. Merging...`);

      // Update songs to point to existing progression
      const songsUpdated = await sql`UPDATE songs SET "progressionId" = ${newId} WHERE "progressionId" = ${oldId}`;
      console.log(`  ✓ Updated songs`);

      // Update quiz questions to point to existing progression
      await sql`UPDATE quiz_questions SET "progressionId" = ${newId} WHERE "progressionId" = ${oldId}`;
      console.log(`  ✓ Updated quiz questions`);

      // Delete old progression
      await sql`DELETE FROM progressions WHERE id = ${oldId}`;
      console.log(`  ✓ Deleted old progression "${oldId}"`);
    } else {
      // Step 1: Create new progression with name as ID
      await sql`
        INSERT INTO progressions (id, name, numerals, description, difficulty, "createdAt", "updatedAt")
        VALUES (
          ${newId},
          ${oldProgression.name},
          ${oldProgression.numerals},
          ${oldProgression.description},
          ${oldProgression.difficulty},
          ${oldProgression.createdAt},
          NOW()
        )
      `;
      console.log(`  ✓ Created new progression "${newId}"`);

      // Step 2: Update songs to point to new progression
      await sql`UPDATE songs SET "progressionId" = ${newId} WHERE "progressionId" = ${oldId}`;
      console.log(`  ✓ Updated songs`);

      // Step 3: Update quiz questions to point to new progression
      await sql`UPDATE quiz_questions SET "progressionId" = ${newId} WHERE "progressionId" = ${oldId}`;
      console.log(`  ✓ Updated quiz questions`);

      // Step 4: Delete old progression
      await sql`DELETE FROM progressions WHERE id = ${oldId}`;
      console.log(`  ✓ Deleted old progression "${oldId}"`);
    }
  }

  console.log('\n✅ Migration complete!');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  });
