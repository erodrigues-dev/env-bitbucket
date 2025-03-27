# ENV Bitbucket CLI

Cli utility to list and edit environment variables of bitbucket

```shell
npx env-bitbucket config -t bitbucket_token -w workspace_name -r repository_name
```

## Commands

```shell
# list all enviroments and display environment Id
npx env-bitbucket env:list

# list all variables for environment provided
npx env-bitbucket env:list:variables <environmentId>

# update all variables based in env file provided
npx env-bitbucket env:update --id {12345} --env-file .env.staging
```
