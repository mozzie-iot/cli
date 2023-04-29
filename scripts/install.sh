#!/bin/bash

DOWNLOAD_VERSION=$1

CLI_INSTALL_DIR='/usr/lib/huebot-cli'
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

    "${CLI_INSTALL_DIR}"/scripts/download-release.sh "${DOWNLOAD_VERSION}"

    printf "\nINSTALL ARGS - redis password: %s, session secret: %s, mqtt username: %s, mqtt password: %s\n\n" "${REDIS_PASSWORD}" "${SESSION_SECRET}" "${MQTT_USERNAME}" "${MQTT_PASSWORD}"

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

    printf "Moving files from %s to %s..." "${TMP_INSTALL_DIR}" "${RUN_DIR}"
    if ! cp -a "${TMP_INSTALL_DIR}/." "${RUN_DIR}" ; then
        printf "Failed: Error while copying files from tmp dir"
        error_found
    fi
    printf "Done.\n"

    exec /bin/bash "${RUN_DIR}"/scripts/install.sh
}

runInstall


