// Load environment variables before importing anything
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Register tsx for TypeScript execution
require('tsx/cjs');
require('./create-invitation.ts');
