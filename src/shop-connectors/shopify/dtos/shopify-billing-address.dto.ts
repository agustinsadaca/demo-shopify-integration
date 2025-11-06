export class ShopifyBillingAddressDto {
  first_name?: string
  last_name?: string
  address1?: string
  address2?: string
  company?: string
  email?: string
  zip?: string
  city?: string
  province?: string
  country_code?: string
  phone?: string
}

export class ShopifyBillingAddressGraphQLDto {
  firstName: string
  lastName: string
  address1: string
  address2: string
  company: string
  // email?: string // not found and not in use
  zip: string
  city: string
  province: string
  countryCodeV2: string
  phone: string
}
