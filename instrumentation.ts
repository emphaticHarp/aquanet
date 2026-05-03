export async function register() {
  // Instrumentation hook - runs before API routes
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('✅ Server instrumentation loaded');
  }
}
