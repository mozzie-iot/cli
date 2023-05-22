#!/bin/bash

NON_ROOT_USER=$1
DOWNLOAD_VERSION=$2
CLI_SCRIPTS_DIR=$3

RUN_DIR="/usr/local/bin/huebot/runner"

{
    set -e
    SUDO=''
    if [ "$(id -u)" != "0" ]; then
      SUDO='sudo'
      echo "This script requires superuser access to install the Huebot environment."
      echo "You will be prompted for your password by sudo."
      # clear any previous sudo permission
      sudo -k
    fi

    $SUDO sh <<SCRIPT
  set -ex

    "${CLI_SCRIPTS_DIR}"/download-release.sh "${DOWNLOAD_VERSION}"

    "${CLI_SCRIPTS_DIR}"/setup-install.sh $DOWNLOAD_VERSION

    "${RUN_DIR}"/scripts/install.sh $NON_ROOT_USER
   
SCRIPT

}




