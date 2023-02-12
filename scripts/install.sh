#!/bin/bash

DOWNLOAD_VERSION=$1
API_KEY=$2
SECRET_KEY=$3
INSTALL_TYPE=${4:-production} # development | production (defaults to production)
AP_INTERFACE=$5
TMP_INSTALL_DIR="/tmp/huebot-${DOWNLOAD_VERSION}"
HUEBOT_DIR="/usr/local/bin/huebot"
RUN_DIR="${HUEBOT_DIR}/runner"


runInstall() {

    function error_found {
        printf "\n\n"
        printf "#### ERROR ####\n"
        printf "There was an error detected during install"
        exit 1
    }

    sudo /bin/bash scripts/download-release.sh "${DOWNLOAD_VERSION}"

    printf "\nINSTALL ARGS - api_key: %s, secret_key: %s, type: %s, ap_int: %s\n\n" "${API_KEY}" "${SECRET_KEY}" "${INSTALL_TYPE}" "${AP_INTERFACE}"

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

    exec sudo /bin/bash "${RUN_DIR}"/scripts/install.sh $API_KEY $SECRET_KEY $INSTALL_TYPE $AP_INTERFACE

}

runInstall


