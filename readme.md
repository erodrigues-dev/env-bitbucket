# ENV Bitbucket CLI

Cli utility to list and edit environment variables of bitbucket


```shell
evb config -t bitbucket_token -w workspace_name -r repository_name
```

## Help

```
evb -h

Usage: index [options] [command]


  Bitbucket Environment CLI

  Alias: evb

  You need call 'config' before use this cli


Options:
  -h, --help                                    display help for command

Commands:
  version|v                                     Show cli version
  config [options]                              Set configurations for Bitbucket
  use                                           Set current project name as config repository
  env:list [options]                            List environments
  env:list:variables [options] <environmentId>  List environment variables
  env:update [options]                          Update environment
  help [command]                                display help for command
```

## Commands to discover environment id and update it

```shell
# list all enviroments and display environment Id
npx evb env:list

# list all variables for environment provided
npx evb env:list:variables <environmentId>

# update all variables based in env file provided
npx evb env:update --id {12345} --env-file .env.staging
```
