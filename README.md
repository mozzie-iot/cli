# Huebot CLI

<br/>

## Development 
1. Clone repo
2. `npm install`

## Creating new version/release

#### Creating and setting new GPG key
1. `gpg --gen-key` (use `gpg --list-keys` to see keys created)
2. export key to file -> `gpg --export -a [name of key author] > release.key`
3. Upload and replace `release.key` in bucket root
4. Go to file permissions and make public key readable to everyone

#### Set environment variables:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `HUEBOT_DEB_KEY=<GPG KEY ID>`

---
In cli directory
1. Appropriately update the version in package.json
2. `npm run build`
3. `npx oclif pack deb` (see note below: might need to run `sudo apt-get install bzip2`) && (Make sure Release.gpg was created - should be asked for GPG password at the end of this step)
4. `npx oclif upload deb`
5. `npx oclif promote --deb --sha [sha] --version [version]` (this will move version files to /channels/stable/apt which is the install path)

Note: use `npm run dev [cmd]` to run for development (sets NODE_ENV to development) 


<br/><br/>

## Install

---

`bash <(wget -qO- https://raw.githubusercontent.com/huebot-iot/cli/main/scripts/install-cli.sh)`

---

## Upgrade (How it works)
1. `download-release.sh` downloads and extracts latest release in `/tmp` dir
2. `docker-compose down` current version in `/usr/local/bin/huebot/runner` dir
3. Move current version (`/usr/local/bin/huebot/runner`) to backup (`/usr/local/bin/huebot/runner-backup`)
4. Move `/tmp/huebot-[version]/` to `/usr/local/bin/huebot/runner`
5. `cd /usr/local/bin/huebot/runner && docker-compose pull`
6. If pull fails, move backup back to runner and start up
7. If new version is successful, delete `/usr/local/bin/huebot/runner-backup` and purge unused images 


## Some development gotchas
- If creating a new bucket, need to create [index document](https://docs.aws.amazon.com/AmazonS3/latest/userguide/IndexDocumentSupport.html) to make it publicly accessible and [enable for public hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/EnableWebsiteHosting.html)
- When running `apt-get update` there were issues with malformed S3 links, so I needed to include the following under `redirection rules` in "Static website hosting" settings:
```
[
    {
        "Condition": {
            "KeyPrefixEquals": "apt/./"
        },
        "Redirect": {
            "ReplaceKeyPrefixWith": "channels/stable/apt/"
        }
    }
]
```
- Sometimes get `tmp` dir ownership errors when running `npx oclif pack deb`. No idea why, but just `chown -R` the repo dir (this could be due to not incrementing package.json version - will monitor)
- `bzip2: not found` error - needed to install `sudo apt-get install bzip2`. Not sure why this one comes up. 
- S3 Timeout Error when running `npx oclif upload deb`: noticed this error when trying to push over ssh. Connected to WiFi and it worked.
- On Ubuntu when running `npx oclif pack deb` I was getting "gpg: signing failed: Inappropriate ioctl for device" error. I came across this [gpg issue](https://github.com/keybase/keybase-issues/issues/2798) provides a workaround by entering `export GPG_TTY=$(tty)` in command line.
