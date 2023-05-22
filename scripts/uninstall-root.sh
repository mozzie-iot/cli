#!/bin/bash
CLI_SCRIPTS_DIR=$1

RUN_DIR="/usr/local/bin/huebot/runner"

{
    set -e
    SUDO=''
    if [ "$(id -u)" != "0" ]; then
      SUDO='sudo'
      echo "This script requires superuser access to uninstall the Huebot environment."
      echo "You will be prompted for your password by sudo."
      # clear any previous sudo permission
      sudo -k
    fi

    $SUDO sh <<SCRIPT
  set -ex

    "${RUN_DIR}"/scripts/uninstall.sh

    "${CLI_SCRIPTS_DIR}"/uninstall-finish.sh
   
SCRIPT

}
