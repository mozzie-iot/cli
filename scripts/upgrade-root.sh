#!/bin/bash
DOWNLOAD_VERSION=$1
CLI_SCRIPTS_DIR=$2

{
    set -e
    SUDO=''
    if [ "$(id -u)" != "0" ]; then
      SUDO='sudo'
      echo "This script requires superuser access to upgrade the Huebot environment."
      echo "You will be prompted for your password by sudo."
      # clear any previous sudo permission
      sudo -k
    fi

    $SUDO sh <<SCRIPT
  set -ex

    "${CLI_SCRIPTS_DIR}"/upgrade.sh $DOWNLOAD_VERSION $CLI_SCRIPTS_DIR
   
SCRIPT

}