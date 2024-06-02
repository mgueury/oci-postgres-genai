#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

export DB_USER="##DB_USER##"
export DB_PASSWORD="##DB_PASSWORD##"
export DB_URL="##DB_URL##"

export STREAM_OCID="##STREAM_OCID##"
export STREAM_BOOSTRAPSERVER="##STREAM_BOOSTRAPSERVER##"
export FUNCTION_ENDPOINT="##FUNCTION_ENDPOINT##"

python3.9 app.py 2>&1 | tee app.log


