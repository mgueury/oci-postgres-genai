// ------------------------ PostgreSQL -----------------------------   
resource "oci_psql_configuration" "starter_psql_configuration" {
    #Required
    compartment_id = local.lz_db_cmp_ocid
    db_configuration_overrides {
        #Required
    #        #Required
    #        config_key = var.configuration_db_configuration_overrides_items_config_key
    #        overriden_config_value = var.configuration_db_configuration_overrides_items_overriden_config_value
    #    }
        items {
          config_key = "oci.admin_enabled_extensions"
          overriden_config_value = "vector"
        }    
    }
    db_version = "15"
    display_name = "${var.prefix}-psql-config"
    shape = "VM.Standard.E4.Flex"

    #Optional
    freeform_tags = local.freeform_tags
    is_flexible = true
}



resource "oci_psql_db_system" "starter_psql" {
  compartment_id      = local.lz_db_cmp_ocid
  instance_count = "1"
  system_type = "OCI_OPTIMIZED_STORAGE"

  #Required
  db_version          = "14"
  display_name = "${var.prefix}psql"
  network_details {
    subnet_id = data.oci_core_subnet.starter_db_subnet.id
  }
  shape = "PostgreSQL.VM.Standard.E4.Flex.2.32GB"
  config_id = oci_psql_configuration.starter_psql_configuration.id
  
  storage_details {
    # is_regionally_durable = false # For Frankfurt
    is_regionally_durable = false
    availability_domain = data.oci_identity_availability_domain.ad.name
    system_type = "OCI_OPTIMIZED_STORAGE"
  }
  credentials {
    username = "postgres"
    password_details {
      password_type = "PLAIN_TEXT"
      password = var.db_password
    }
  }
  freeform_tags = local.freeform_tags
}

# Compatibility with plsql_existing.tf 
data "oci_psql_db_system" "starter_psql" {
  #Required
  db_system_id = oci_psql_db_system.starter_psql.id
}
locals {
    db_host = data.oci_psql_db_system.starter_psql.network_details[0].primary_db_endpoint_private_ip
    db_port = "5432"
    db_url = local.db_host
    // jdbc:postgresql://localhost:5432/postgres
    jdbc_url = format("jdbc:postgresql://%s:%s/postgres", local.db_host, local.db_port )
}  

