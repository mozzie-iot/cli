#!/bin/bash
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

    # add huebot repository to apt
    echo "deb http://huebot-cli.s3-website-us-east-1.amazonaws.com/apt ./" > /etc/apt/sources.list.d/huebot.list

    # install Huebot's CLI release key for package verification
    curl http://huebot-cli.s3-website-us-east-1.amazonaws.com/release.key | apt-key add -

    # update your sources
    apt-get update

    # install the toolbelt
    apt-get install -y huebot

SCRIPT
}

echo ""
echo "*****************************************************************"
echo ""
echo "Huebot CLI successfully installed!"
echo ""
echo "*****************************************************************"
echo ""