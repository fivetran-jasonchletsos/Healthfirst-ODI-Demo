terraform {
  required_version = ">= 1.5.0"

  required_providers {
    fivetran = {
      source  = "fivetran/fivetran"
      version = "~> 1.1"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}
