const { createOpencodeClient } = require('@opencode-ai/sdk');

async function generateLogo() {
  const client = createOpencodeClient({
    baseUrl: 'http://127.0.0.1:4096'
  });

  try {
    const result = await client.session.shell({
      path: { id: 'default' },
      body: {
        agent: 'build',
        command: `Use the stitch MCP to generate a modern, minimalist logo for "Rose Orchestrator" - an autonomous AI coding agent. The logo should feature:
- A rose flower symbol combined with a star/compass element
- Color palette: deep pink (#e91e63) to purple (#9c27b0) gradient
- Clean, geometric style
- Suitable for dark backgrounds
- Professional tech company aesthetic`
      }
    });
    
    console.log('Logo generation result:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

generateLogo();
