variable idcs_domain_name { default = "Default" }
variable idcs_url { default = "" }

data "oci_identity_domains" "starter_domains" {
    #Required
    compartment_id = var.tenancy_ocid
    display_name = var.idcs_domain_name
}

locals {
  idcs_url = (var.idcs_url!="")?var.idcs_url:data.oci_identity_domains.starter_domains.domains[0].url
}


resource "oci_identity_policy" "starter_search_policy" {
    provider       = oci.home    
    name           = "${var.prefix}-policy"
    description    = "${var.prefix} policy"
    compartment_id = local.lz_serv_cmp_ocid

    statements = [
        "allow any-user to manage objects in compartment id ${local.lz_serv_cmp_ocid} where request.principal.id='${oci_functions_function.starter_fn_function[0].id}'",
        "allow any-user to manage all-resources in compartment id ${local.lz_serv_cmp_ocid} where request.principal.id='${oci_core_instance.starter_bastion.id}'",
        "allow any-user to manage stream-family in compartment id ${local.lz_serv_cmp_ocid} where request.principal.id='${oci_core_instance.starter_bastion.id}'"
        # "Allow dynamic-group ${var.idcs_domain_name}/${var.prefix}-fn-dyngroup to manage objects in compartment id ${var.compartment_ocid}",
        # "Allow dynamic-group ${var.idcs_domain_name}/${var.prefix}-bastion-dyngroup to manage all-resources in compartment id ${var.compartment_ocid}",
        # "Allow dynamic-group ${var.idcs_domain_name}/${var.prefix}-bastion-dyngroup to manage stream-family in compartment id ${var.compartment_ocid}"
    ]
}

