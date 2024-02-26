import { setConfig } from '../config/config.js';

export class SetConfiguration {
  async execute({ token, workspace, repository }) {
    const config = {
      token: token,
      url: `https://api.bitbucket.org/2.0/repositories/${workspace}/${repository}`,
    };

    setConfig(config);
  }
}
