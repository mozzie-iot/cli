# Harness CLI

<br/>

## Creating new version/release

#### Set environment variables:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `HARNESS_CLI_DEB_KEY=<GPG KEY ID>`

---

1. Appropriately update the version in package.json
2. `cd ~/cli && npm run build`
3. `cd ~/cli && oclif pack deb`
4. `cd ~/cli && oclif upload deb`
5. In AWS, copy contents of `versions/[version]/[sha]/apt` into `latest` folder

Note: use `npm run dev [cmd]` to run for development (sets NODE_ENV to development)

<br/><br/>

## Install

---

`bash <(wget -qO- https://raw.githubusercontent.com/harness-iot/cli/main/scripts/install.sh)`
