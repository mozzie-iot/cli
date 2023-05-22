#!/bin/bash

if [ "$EUID" -ne 0 ] ; then
  printf "Must be run as root.\n"
  exit 1
fi

runUninstallFinish() {

  function error_found {
      printf "\n\n"
      printf "#### ERROR ####\n"
      printf "There was an error detected during uninstallation\n\n"
      exit 1
  }

  HUEBOT_DIR="/usr/local/bin/huebot"
  if [ -d "${HUEBOT_DIR}" ] ; then
    printf "Removing Huebot directory..."
    if ! rm -rf "${HUEBOT_DIR}" ; then
        printf "Failed trying to delete directory: %s.\n" "${HUEBOT_DIR}"
        error_found
    fi
    printf "Done.\n"
  fi

  MOSQUITTO_DIR="/usr/local/bin/mosquitto"
  if [ -d "${MOSQUITTO_DIR}" ] ; then
    printf "Removing Mosquitto directory..."
    if ! rm -rf "${MOSQUITTO_DIR}" ; then
        printf "Failed trying to delete directory: %s.\n" "${MOSQUITTO_DIR}"
        error_found
    fi
    printf "Done.\n"
  fi

  printf "\n\n\n************************ UNINSTALL COMPLETE ************************\n\n\n"
  printf "Huebot system environment successfully uninstalled!\n"
  printf "Note: APT packages installed with Huebot have not been uninstalled \n"
  printf "and port configuration changes have not been reverted!\n"
  printf "\n\n******************************************************************\n\n\n"
}

runUninstallFinish