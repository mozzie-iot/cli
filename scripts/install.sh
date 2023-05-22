#!/bin/bash

DOWNLOAD_VERSION=$1
CLI_SCRIPTS_DIR=$2

TMP_INSTALL_DIR="/tmp/huebot-${DOWNLOAD_VERSION}"
HUEBOT_DIR="/usr/local/bin/huebot"
RUN_DIR="${HUEBOT_DIR}/runner"

if [ "$EUID" -ne 0 ] ; then
  printf "Must be run as root.\n"
  exit 1
fi

runInstall() {

    function error_found {
        printf "\n\n"
        printf "#### ERROR ####\n"
        printf "There was an error detected during install"
        exit 1
    }

    "${CLI_SCRIPTS_DIR}"/download-release.sh "${DOWNLOAD_VERSION}"

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
    LERNA_FILE="${TMP_INSTALL_DIR}/lerna.json"
    if ! cp -a "${LERNA_FILE}" "${RUN_DIR}" ; then
        printf "Failed: Error while copying %s.\n" "${LERNA_FILE}"
        error_found
    fi

    DC_FILE="${TMP_INSTALL_DIR}/docker/docker-compose.prod.yml"
    if ! cp -a "${DC_FILE}" "${RUN_DIR}/docker-compose.yml" ; then
        printf "Failed: Error while copying %s.\n" "${DC_FILE}"
        error_found
    fi

    INSTALL_SCRIPT="${TMP_INSTALL_DIR}/scripts/install.sh"
    if ! cp -a "${INSTALL_SCRIPT}" "${RUN_DIR}/scripts" ; then
        printf "Failed: Error while copying %s.\n" "${INSTALL_SCRIPT}"
        error_found
    fi

    UNINSTALL_SCRIPT="${TMP_INSTALL_DIR}/scripts/uninstall.sh"
    if ! cp -a "${UNINSTALL_SCRIPT}" "${RUN_DIR}/scripts" ; then
        printf "Failed: Error while copying %s.\n" "${UNINSTALL_SCRIPT}"
        error_found
    fi
    printf "Done.\n"

    exec /bin/bash "${RUN_DIR}"/scripts/install.sh
}

runInstall


