export class ShopifyShippingAddressDto {
  first_name: string
  last_name: string
  address1: string
  address2: string
  company: string
  zip: string
  city: string
  province: string
  country_code: string
  phone: string
}

export class ShopifyShippingAddressGraphQLDto {
  firstName: string
  lastName: string
  address1: string
  address2: string
  company: string
  zip: string
  city: string
  province: string
  countryCodeV2: string
  phone: string
}


export class ShopifyDestinationAddressGraphQLDto {
  firstName: string
  lastName: string
  email: string
  address1: string
  address2: string
  company: string
  zip: string
  city: string
  province: string
  countryCode: string
  phone: string
}