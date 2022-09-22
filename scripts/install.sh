#!/bin/sh
{
    set -e
    SUDO=''
    if [ "$(id -u)" != "0" ]; then
      SUDO='sudo'
      echo "This script requires superuser access to install apt packages."
      echo "You will be prompted for your password by sudo."
      # clear any previous sudo permission
      sudo -k
    fi

    # run inside sudo
    $SUDO sh <<SCRIPT
  set -ex

    # NMCLI req for setup
    apt-get update && apt-get install -y network-manager

    # add harness repository to apt
    echo "deb http://harness-cli.s3-website-us-east-1.amazonaws.com/latest ./" > /etc/apt/sources.list.d/harness-cli.list

    # install heroku's release key for package verification
    curl http://harness-cli.s3-website-us-east-1.amazonaws.com/release.key | apt-key add -

    # update your sources
    apt-get update

    # install the toolbelt
    apt-get install -y harness-cli

SCRIPT
  echo "Harness CLI successfully installed!"
  harness-cli install
}