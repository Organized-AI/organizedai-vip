export default {
  async scheduled(event, env, ctx) {
    if (!env.CF_DEPLOY_HOOK_URL) {
      console.error('CF_DEPLOY_HOOK_URL not configured');
      return;
    }

    const res = await fetch(env.CF_DEPLOY_HOOK_URL, { method: 'POST' });

    if (res.ok) {
      console.log('Redeploy triggered successfully');
    } else {
      console.error(`Redeploy failed: ${res.status} ${res.statusText}`);
    }
  },
};
