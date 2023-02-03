const core = require('@actions/core');
const axios = require('axios');

async function run() {
  try {
    const name = core.getInput('name');
    const accessToken = core.getInput('access-token');

    await axios.delete(
      'https://api.github.com/repos/' + name,
      {
        headers: {
          Authorization: 'token ' + accessToken
        }
      }
    )
    core.info('Repository deleted.');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
