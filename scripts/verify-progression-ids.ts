import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(connectionString);

async function main() {
  console.log('🔍 Verifying progression IDs...\n');

  let hasErrors = false;

  // Check 1: All progressions have id === name
  console.log('1️⃣  Checking progressions have id === name...');
  const progressions = await sql`SELECT id, name FROM progressions`;
  const mismatchedProgressions = progressions.filter((p) => p.id !== p.name);

  if (mismatchedProgressions.length > 0) {
    hasErrors = true;
    console.log('   ❌ Found progressions with id !== name:');
    for (const p of mismatchedProgressions) {
      console.log(`      - id: "${p.id}", name: "${p.name}"`);
    }
  } else {
    console.log(`   ✅ All ${progressions.length} progressions have id === name`);
  }

  // Check 2: No orphaned songs
  console.log('\n2️⃣  Checking for orphaned songs...');
  const orphanedSongs = await sql`
    SELECT s.id, s.title, s.artist, s."progressionId"
    FROM songs s
    LEFT JOIN progressions p ON s."progressionId" = p.id
    WHERE p.id IS NULL
  `;

  if (orphanedSongs.length > 0) {
    hasErrors = true;
    console.log('   ❌ Found orphaned songs (no matching progression):');
    for (const s of orphanedSongs) {
      console.log(`      - "${s.title}" by ${s.artist} (progressionId: "${s.progressionId}")`);
    }
  } else {
    const [{ count: songCount }] = await sql`SELECT COUNT(*) FROM songs`;
    console.log(`   ✅ All ${songCount} songs have valid progressions`);
  }

  // Check 3: No orphaned quiz questions
  console.log('\n3️⃣  Checking for orphaned quiz questions...');
  const orphanedQuestions = await sql`
    SELECT q.id, q."progressionId"
    FROM quiz_questions q
    LEFT JOIN progressions p ON q."progressionId" = p.id
    WHERE q."progressionId" IS NOT NULL AND p.id IS NULL
  `;

  if (orphanedQuestions.length > 0) {
    hasErrors = true;
    console.log('   ❌ Found orphaned quiz questions (no matching progression):');
    for (const q of orphanedQuestions) {
      console.log(`      - Question ${q.id} (progressionId: "${q.progressionId}")`);
    }
  } else {
    const [{ count: questionCount }] = await sql`SELECT COUNT(*) FROM quiz_questions WHERE "progressionId" IS NOT NULL`;
    console.log(`   ✅ All ${questionCount} quiz questions with progressionId have valid progressions`);
  }

  // Summary
  console.log('\n' + '─'.repeat(50));
  if (hasErrors) {
    console.log('❌ Verification FAILED - see errors above');
    process.exit(1);
  } else {
    const [{ count: progressionCount }] = await sql`SELECT COUNT(*) FROM progressions`;
    const [{ count: songCount }] = await sql`SELECT COUNT(*) FROM songs`;
    const [{ count: questionCount }] = await sql`SELECT COUNT(*) FROM quiz_questions WHERE "progressionId" IS NOT NULL`;

    console.log('✅ Verification PASSED - all checks passed!');
    console.log(`\nSummary:`);
    console.log(`  - ${progressionCount} progressions (all with id === name)`);
    console.log(`  - ${songCount} songs (all with valid progressions)`);
    console.log(`  - ${questionCount} quiz questions with progressions (all valid)`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  });
