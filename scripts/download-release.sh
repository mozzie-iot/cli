#!/bin/bash
# Download and extract the latest hub version for either install or upgrade

DOWNLOAD_VERSION=$1
DOWNLOAD_URL="https://github.com/huebot-iot/huebot/archive/refs/tags/${DOWNLOAD_VERSION}.tar.gz"
DOWNLOAD_DIR="/tmp"
TARBALL_FILE="huebot-${DOWNLOAD_VERSION}"
TMP_INSTALL_DIR="/tmp/huebot-${DOWNLOAD_VERSION}"

if [ "$EUID" -ne 0 ] ; then
  printf "Must be run as root.\n"
  exit 1
fi

runDownload() {

    function error_found {
        printf "\n\n"
        printf "#### ERROR ####\n"
        printf "There was an error detected during the download and extract"
        exit 1
    }

    printf "\nDownloading version: %s\n" "${DOWNLOAD_VERSION}"

    if ! wget --quiet -O "${DOWNLOAD_DIR}"/"${TARBALL_FILE}".tar.gz ${DOWNLOAD_URL} ; then
        printf "Failed: Error while trying to wget new version.\n"
        printf "File requested: %s -> %s/%s.tar.gz\n" "${DOWNLOAD_URL}" "${DOWNLOAD_DIR}" "${TARBALL_FILE}"
        error_found
    fi

    printf "\nDownload complete\n"

    if [ -d "${TMP_INSTALL_DIR}" ] ; then
        printf "The tmp directory %s already exists. Removing..." "${TMP_INSTALL_DIR}"
        if ! rm -rf "${TMP_INSTALL_DIR}" ; then
            printf "Failed: Error while trying to delete tmp directory %s.\n" "${TMP_INSTALL_DIR}"
            error_found
        fi
        printf "Done.\n"
    fi

    printf "Creating %s..." "${TMP_INSTALL_DIR}"
    if ! mkdir "${TMP_INSTALL_DIR}" ; then
        printf "Failed: Error while trying to create %s.\n" "${TMP_INSTALL_DIR}"
        error_found
    fi
    printf "Done.\n"

    printf "Extracting %s/%s.tar.gz to %s..." "${DOWNLOAD_DIR}" "${TARBALL_FILE}" "${TMP_INSTALL_DIR}"
    if ! tar xzf "${DOWNLOAD_DIR}"/"${TARBALL_FILE}".tar.gz -C "${TMP_INSTALL_DIR}" --strip-components=1 ; then
        printf "Failed: Error while trying to extract files from %s/%s.tar.gz to %s.\n" "${DOWNLOAD_DIR}" "${TARBALL_FILE}" "${TMP_INSTALL_DIR}"
        error_found
    fi
    printf "Done.\n"

    printf "Removing %s/%s.tar.gz..." "${DOWNLOAD_DIR}" "${TARBALL_FILE}"
    if ! rm -rf "${DOWNLOAD_DIR}"/"${TARBALL_FILE}".tar.gz ; then
        printf "Failed: Error while removing %s/%s.tar.gz.\n" "${DOWNLOAD_DIR}" "${TARBALL_FILE}"
    fi
    printf "Done.\n"

}

runDownload


 