#!/bin/bash
# Create install directory and move required release files into it
DOWNLOAD_VERSION=$1

HUEBOT_DIR="/usr/local/bin/huebot"
TMP_INSTALL_DIR="/tmp/huebot-${DOWNLOAD_VERSION}"
RUN_DIR="${HUEBOT_DIR}/runner"

if [ "$EUID" -ne 0 ] ; then
  printf "Must be run as root.\n"
  exit 1
fi

runInstallSetup() {

    function error_found {
        printf "\n\n"
        printf "#### ERROR ####\n"
        printf "There was an error detected during the install setup\n\n"
        exit 1
    }

    if [ -d "${HUEBOT_DIR}" ] ; then
        printf "The huebot directory %s already exists. Removing..." "${HUEBOT_DIR}"
        if ! rm -rf "${HUEBOT_DIR}" ; then
            printf "Failed: Error while trying to delete huebot directory %s.\n" "${HUEBOT_DIR}"
            error_found
        fi
        printf "Done.\n"
    fi

    printf "Creating %s..." "${HUEBOT_DIR}"
    if ! mkdir "${HUEBOT_DIR}" ; then
        printf "Failed: Error while trying to create %s.\n" "${HUEBOT_DIR}"
        error_found
    fi
    printf "Done.\n"

    printf "Creating %s..." "${RUN_DIR}"
    if ! mkdir "${RUN_DIR}" ; then
        printf "Failed: Error while trying to create %s.\n" "${RUN_DIR}"
        error_found
    fi
    printf "Done.\n"

    printf "Creating %s..." "${RUN_DIR}/scripts"
    if ! mkdir "${RUN_DIR}/scripts" ; then
        printf "Failed: Error while trying to create %s.\n" "${RUN_DIR}/scripts"
        error_found
    fi
    printf "Done.\n"

    printf "Copying run files from %s to %s..." "${TMP_INSTALL_DIR}" "${RUN_DIR}"
    if ! cp -a "${TMP_INSTALL_DIR}/lerna.json" "${RUN_DIR}" ; then
        printf "Failed: Error while copying %s.\n" "${TMP_INSTALL_DIR}/lerna.json"
        error_found
    fi

    if ! cp -a "${TMP_INSTALL_DIR}/docker/docker-compose.prod.yml" "${RUN_DIR}/docker-compose.yml" ; then
        printf "Failed: Error while copying %s.\n" "${TMP_INSTALL_DIR}/docker/docker-compose.prod.yml"
        error_found
    fi

    if ! cp -a "${TMP_INSTALL_DIR}/scripts/install.sh" "${RUN_DIR}/scripts" ; then
        printf "Failed: Error while copying %s.\n" "${TMP_INSTALL_DIR}/scripts/install.sh"
        error_found
    fi

    if ! cp -a "${TMP_INSTALL_DIR}/scripts/uninstall.sh" "${RUN_DIR}/scripts" ; then
        printf "Failed: Error while copying %s.\n" "${TMP_INSTALL_DIR}/scripts/uninstall.sh"
        error_found
    fi
    printf "Done.\n"

}

runInstallSetup


 