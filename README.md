# Harness CLI

<br/><br/>

## Creating new version/release

#### `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` must be added to env vars

---

1. Appropriately update the version in package.json
2. In project root, run `oclif pack tarballs -t linux-arm --no-xz`
3. `cd ./dist`, run `oclif upload tarballs -t linux-arm --no-xz`
4. In AWS, copy object (`.gz file`) into 'latest' folder
5. Delete last version and change name of current version to `harness-cli-linux-arm.tar.gz`

<br/><br/>

## Install and run

---

1. `cd && curl https://harness-cli.s3.amazonaws.com/versions/latest/harness-cli-linux-arm.tar.gz | tar zxf -`
2. `~/harness-cli/bin/run install`

<br/><br/>

## Development

---

Note: use `npm run dev [cmd]` to run for development (sets NODE_ENV to development)
