const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { GoogleAuth } = require('google-auth-library');

async function accessSecret(secretName, projectId) {
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  });

  const authClient = await auth.getClient();
  const client = new SecretManagerServiceClient({ auth: authClient });

  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
  });

  const payload = version.payload.data.toString();
  return payload;
}

module.exports = accessSecret;
