#!/bin/bash

DOWNLOAD_VERSION=$1
TMP_INSTALL_DIR="/tmp/huebot-${DOWNLOAD_VERSION}"
CLI_INSTALL_DIR='/usr/lib/huebot-cli'
HUEBOT_DIR="/usr/local/bin/huebot"
RUN_DIR="${HUEBOT_DIR}/runner"
LOG_STATUS=$HUEBOT_DIR/.upgrade
LOG_FILE=$HUEBOT_DIR/upgrade.log

if [ "$EUID" -ne 0 ] ; then
  printf "Must be run as root.\n"
  exit 1
fi

runUpgrade() {

    function pre_upgrade_error_found {
        echo '2' > $LOG_STATUS
        printf "\n\n"
        printf "#### ERROR ####\n"
        printf "There was an error preventing the upgrade from starting!"
        exit 1
    }

    function upgrade_error_found {
        echo '2' > $LOG_STATUS
        printf "\n\n"
        printf "#### ERROR ####\n"
        printf "There was an error detected during upgrade... Restoring backup!"

        if [ -d $RUN_DIR ] ; then
            printf "Delete new release from runner dir..."
            if ! rm -R $RUN_DIR >> $LOG_FILE 2>&1; then
                printf "Failed to delete %s.\n" "$RUN_DIR"
                exit 1
            fi
            printf "Done.\n"
        fi
        
        printf "Move backup to runner dir..."
        if ! mv $HUEBOT_DIR/backup-runner $RUN_DIR >> $LOG_FILE 2>&1; then
            printf "Failed to move %s to %s.\n" "$HUEBOT_DIR/backup-runner" "$RUN_DIR"
            exit 1
        fi
        printf "Done.\n"

        printf "Start containers..."
        if ! docker-compose -f $RUN_DIR/docker-compose.yml up -d >> $LOG_FILE 2>&1 ; then
            printf "Failed to start containers in file %s.\n" "$RUN_DIR/docker-compose.yml"
            exit 1
        fi
        printf "Done.\n"

        exit 1
    }

    function post_upgrade_error_found {
        echo '2' > $LOG_STATUS
        printf "\n\n"
        printf "#### ERROR ####\n"
        printf "Upgrade successful but clean up failed!"
        exit 1
    }

    "${CLI_INSTALL_DIR}"/scripts/download-release.sh "${DOWNLOAD_VERSION}"

    echo '1' > $LOG_STATUS

    # Remove stale upgrade log file if found
	if [ -f $LOG_FILE ] ; then
		if ! rm $LOG_FILE >> $LOG_FILE 2>&1 ; then
			printf "Failed to remove %s.\n" "$LOG_FILE"
			pre_upgrade_error_found
		fi
	fi

    # Create new upgrade log file
	if ! touch $LOG_FILE >> $LOG_FILE 2>&1 ; then
		printf "Failed to create %s.\n" "$LOG_FILE"
		pre_upgrade_error_found
	fi

    printf "Stop running containers..."
    if ! docker-compose -f $RUN_DIR/docker-compose.yml down >> $LOG_FILE 2>&1 ; then
        printf "Failed to stop containers in file %s.\n" "$RUN_DIR/docker-compose.yml"
		pre_upgrade_error_found
    fi
    printf "Done.\n"

    printf "Backing up current version..."
    if ! mv $RUN_DIR $HUEBOT_DIR/backup-runner >> $LOG_FILE 2>&1; then
        printf "Failed to move %s to %s.\n" "$RUN_DIR" "${HUEBOT_DIR}/backup-runner"

        printf "Restarting current version containers..."
        if ! docker-compose -f $RUN_DIR/docker-compose.yml up -d >> $LOG_FILE 2>&1 ; then
            printf "Failed to start containers in %s.\n" "$RUN_DIR/docker-compose.yml"
        else
            printf "Done.\n"
        fi
        
        pre_upgrade_error_found
    fi
    printf "Done.\n"

    printf "Move new release to runner directory..."
    if ! mv $TMP_INSTALL_DIR $RUN_DIR >> $LOG_FILE 2>&1; then
        printf "Failed to move %s to %s.\n" "$TMP_INSTALL_DIR" "$RUN_DIR"
        upgrade_error_found
    fi
    printf "Done.\n"

    printf "Running new release upgrade script..."
    if [ ! -x "${TMP_INSTALL_DIR}/scripts/upgrade.sh" ] ; then
        printf "Executable %s not found. Skipping...\n" "$TMP_INSTALL_DIR/scripts/upgrade.sh"
    else
        printf "Done.\n"
    fi
    
    printf "Upgrading containers..."
    if ! docker-compose -f $RUN_DIR/docker-compose.yml pull >> $LOG_FILE 2>&1; then
        printf "Failed to pull Docker containers in %s.\n" "$RUN_DIR/docker-compose.yml"
        upgrade_error_found
    fi
    printf "Done.\n"

    printf "Starting containers..."
    if ! docker-compose -f $RUN_DIR/docker-compose.yml up -d >> $LOG_FILE 2>&1; then
        printf "Failed to start Docker containers in %s.\n" "$RUN_DIR/docker-compose.yml"
        upgrade_error_found
    fi
    printf "Done.\n"

    printf "Delete backup directory..."
    if ! rm -R $HUEBOT_DIR/backup-runner >> $LOG_FILE 2>&1; then
        printf "Failed to delete %s.\n" "$HUEBOT_DIR/backup-runner"
        post_upgrade_error_found
    fi
    printf "Done.\n"

    printf "Delete unused Docker images..."
    if ! docker image prune -a -f >> $LOG_FILE 2>&1; then
        printf "Failed to prune Docker images.\n"
        post_upgrade_error_found
    fi
    printf "Done.\n"

    printf "Successfully upgraded\n"
}

runUpgrade