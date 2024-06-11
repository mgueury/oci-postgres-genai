#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

# Python Server
sudo yum -y install postgresql-devel
sudo dnf install -y python39 python39-devel
sudo pip3.9 install pip --upgrade
pip3.9 install -r requirements.txt

# Store the db_connection in the start.sh

# Get COMPARTMENT_OCID
curl -s -H "Authorization: Bearer Oracle" -L http://169.254.169.254/opc/v2/instance/ > /tmp/instance.json
export TF_VAR_compartment_ocid=`cat /tmp/instance.json | jq -r .compartmentId`

# Change the env.sh
CONFIG_FILE=env.sh
sed -i "s/##DB_USER##/$DB_USER/" $CONFIG_FILE
sed -i "s/##DB_PASSWORD##/$DB_PASSWORD/" $CONFIG_FILE
sed -i "s/##DB_URL##/$DB_URL/" $CONFIG_FILE
sed -i "s/##STREAM_OCID##/$STREAM_OCID/" $CONFIG_FILE
sed -i "s/##FN_OCID##/$FN_OCID/" $CONFIG_FILE

## Contain "/"
sed -i "s!##STREAM_MESSAGE_ENDPOINT##!$STREAM_MESSAGE_ENDPOINT!" $CONFIG_FILE
sed -i "s!##FN_INVOKE_ENDPOINT##!$FN_INVOKE_ENDPOINT!" $CONFIG_FILE

# Create services
create_service () {
    APP_DIR=$1
    COMMAND=$2
    # Create an db service
    cat > /tmp/$COMMAND.service << EOT
[Unit]
Description=$COMMAND
After=network.target

[Service]
Type=simple
ExecStart=/home/opc/$APP_DIR/${COMMAND}.sh
TimeoutStartSec=0
User=opc

[Install]
WantedBy=default.target
EOT
    sudo cp /tmp/$COMMAND.service /etc/systemd/system
    sudo chmod 664 /etc/systemd/system/$COMMAND.service
    sudo systemctl daemon-reload
    sudo systemctl enable $COMMAND.service
    sudo systemctl restart $COMMAND.service
}

create_service app index
create_service app rest 
