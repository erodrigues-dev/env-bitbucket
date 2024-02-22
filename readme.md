# Update ENVs in Bitbucket pipeline

## config

Crie um arquivo .env na raiz do projeto seguindo o formato

```shell
BITBUCKET_URL=https://api.bitbucket.org/2.0/repositories/{workspace}/{repository}
BITBUCKET_TOKEN=Bearer token
```

## Atualizando variaveis

- Primeiro liste os environments copie o uuid
- Depois execute o update informar o id do environment e o path para arquivo de env

```shell
npm run list:environments

npm run update:envs {env_uuid} /some/path/.env.staging
```