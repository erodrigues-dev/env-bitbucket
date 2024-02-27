# ENV Bitbucket CLI

Cli utility to list and edit environment variables of bitbucket


```shell
npm i -D env-bitbucket
npx env-bitbucket config -t bitbucket_token -w workspace_name -r repository_name
```

## Commands

```shell
npx env-bitbucket env:list

npx env-bitbucket env:list:variables <environmentId>

npx env-bitbucket env:update --id {12345} --env-file .env.staging
```