/**
 * Fixed Shipping Address Configuration
 * All orders for VB Spine will ship to this single address.
 * User shipping information is collected for records but not used for actual shipping.
 */

export const FIXED_SHIPPING_ADDRESS = {
  name: 'VB Spine',
  address: '123 Main Street', // TODO: Update with actual shipping address
  address2: '',
  city: 'City', // TODO: Update with actual city
  state: 'ST', // TODO: Update with actual state
  zip: '12345', // TODO: Update with actual ZIP code
  country: 'USA'
}
