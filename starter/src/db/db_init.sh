#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

# XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
# sudo -E bash -c "/home/opc/db/install_postgres.sh"
# export DB_URL=127.0.0.1
# XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Install PostgreSQL client
sudo yum -y install postgresql 
export PGPASSWORD=$DB_PASSWORD
psql -h $DB_URL -d postgres -U $DB_USER -f psql.sql

