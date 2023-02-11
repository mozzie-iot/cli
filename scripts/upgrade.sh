#!/bin/bash

DOWNLOAD_VERSION=$1
TMP_INSTALL_DIR="/tmp/huebot-${DOWNLOAD_VERSION}"

if [ "$EUID" -ne 0 ] ; then
  printf "Must be run as root.\n"
  exit 1
fi

runUpgrade() {

    function error_found {
        printf "\n\n"
        printf "#### ERROR ####\n"
        printf "There was an error detected during upgrade"
        exit 1
    }

    /bin/bash scripts/download-release.sh "${DOWNLOAD_VERSION}"

    if [ ! -x "${TMP_INSTALL_DIR}/scripts/upgrade.sh" ] ; then
        printf "Executable %s not found. Skipping...\n" "${TMP_INSTALL_DIR}/scripts/upgrade.sh"
    fi

    if ! docker-compose -f "${TMP_INSTALL_DIR}/docker-compose.yml" pull ; then
        printf "Docker compose pull failed\n"
        error_found
    fi

    if ! docker-compose -f "${TMP_INSTALL_DIR}/docker-compose.yml" up -d ; then
        printf "Docker compose start containers failed\n"
        error_found
    fi

    if ! cp -a "${TMP_INSTALL_DIR}/." /usr/local/bin/huebot/runner/ ; then
        printf "Failed to set upgrade to current version"
        error_found
    fi

    if ! rm -rf $TMP_INSTALL_DIR ; then
        printf "Failed to remove tmp release folder.\n"
    fi

    printf "Successfully upgraded\n"

}

runUpgrade