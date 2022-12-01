# Huebot CLI

<br/>

## Development 
1. Clone repo
2. `npm install`

## Creating new version/release

#### Creating and setting new GPG key
1. `gpg --gen-key` (use `gpg --list-keys` to see keys created)
2. export key to file -> `export gpg --export -a [name of key author] > release.key`
3. Upload and replay `release.key` in bucket root
4. Go to file permissions and make public key readable to everyone

#### Set environment variables:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `HUEBOT_CLI_DEB_KEY=<GPG KEY ID>`

---

1. Appropriately update the version in package.json
2. `cd ~/cli && npm run build`
3. `cd ~/cli && npx oclif pack deb`
4. `cd ~/cli && npx oclif upload deb`
5. In AWS, copy contents of `versions/[version]/[sha]/apt` into `latest` folder

Note: use `npm run dev [cmd]` to run for development (sets NODE_ENV to development)

<br/><br/>

## Install

---

`bash <(wget -qO- https://raw.githubusercontent.com/huebot-iot/cli/main/scripts/install.sh)`

---
## Some setup gotchas
- If creating a new bucket, need to create [index document](https://docs.aws.amazon.com/AmazonS3/latest/userguide/IndexDocumentSupport.html) to make it publicly accessible and [enable for public hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/EnableWebsiteHosting.html)
- When running `apt-get update` there were issues with malformed S3 links, so I needed to include the following under `redirection rules` in "Static website hosting" settings:
```
[
    {
        "Condition": {
            "KeyPrefixEquals": "latest/./"
        },
        "Redirect": {
            "ReplaceKeyPrefixWith": "latest/"
        }
    }
]
```
