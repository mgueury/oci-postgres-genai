#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

# From How To Setup And Use DBMS_CLOUD Package (Doc ID 2748362.1)
if [ "$DB_PASSWORD" == "" ]; then
   echo "ERROR: DB_PASSWORD not set."
fi

# Install APEX
cd $HOME
export APEX_ZIP=apex_24.1_en.zip
wget https://download.oracle.com/otn_software/apex/$APEX_ZIP
unzip $APEX_ZIP
cd apex; sqlplus '/ as sysdba' <<EOF
@apexins.sql SYSAUX SYSAUX TEMP /i/
exit
EOF

sqlplus / as sysdba <<EOF
ALTER USER APEX_PUBLIC_USER ACCOUNT UNLOCK
ALTER USER APEX_PUBLIC_USER IDENTIFIED BY $DB_PASSWORD
begin 
    apex_instance_admin.set_parameter(
        p_parameter => 'IMAGE_PREFIX',
        p_value     => 'https://static.oracle.com/cdn/apex/24.1.0/' );
    commit;
end;
EOF

sqlplus system/$DB_PASSWORD@PDB1 <<EOF
@apxchpwd.sql
admin
spam@oracle.com
$DB_PASSWORD
EOF


# Install DBMS_CLOUD
$ORACLE_HOME/perl/bin/perl $ORACLE_HOME/rdbms/admin/catcon.pl -u sys/$DB_PASSWORD --force_pdb_mode 'READ WRITE' -b dbms_cloud_install -d /home/oracle/dbc -l /home/oracle/dbc dbms_cloud_install.sql

sqlplus / as sysdba <<EOF
select con_id, owner, object_name, status, sharing, oracle_maintained from cdb_objects where object_name = 'DBMS_CLOUD' order by con_id;
select owner, object_name, status, sharing, oracle_maintained from dba_objects where object_name = 'DBMS_CLOUD';
exit
EOF

mkdir $HOME/dbc_certs
cd $HOME/dbc_certs
wget https://objectstorage.us-phoenix-1.oraclecloud.com/p/QsLX1mx9A-vnjjohcC7TIK6aTDFXVKr0Uogc2DAN-Rd7j6AagsmMaQ3D3Ti4a9yU/n/adwcdemo/b/CERTS/o/dbc_certs.tar
tar xf dbc_certs.tar

mkdir -p /opt/oracle/dcs/commonstore/wallets/ssl
cd /opt/oracle/dcs/commonstore/wallets/ssl

orapki wallet create -wallet . -pwd $DB_PASSWORD -auto_login
#! /bin/bash
for i in /home/oracle/dbc/dbc_cert/*cer 
do
orapki wallet add -wallet . -trusted_cert -cert $i -pwd $DB_PASSWORD
done
orapki wallet display -wallet .
cd $ORACLE_HOME/network/admin
export WALLET_DIR=`pwd`

sed  '/SQLNET.EXPIRE_TIME=10/a WALLET_LOCATION=(SOURCE=(METHOD=FILE)(METHOD_DATA=(DIRECTORY=/opt/oracle/dcs/commonstore/wallets/ssl)))' -i $ORACLE_HOME/network/admin/sqlnet.ora

sqlplus / as sysdba @dcs_aces.sql
sqlplus / as sysdba @dcs_test.sql

