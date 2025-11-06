import { GoogleApisService } from '../../../src/general-connectors/google-apis/google-apis.service'
import GoogleAddressValidationValidResponseDummy from '../../dummies/common/google-address-validation/google-address-validation-valid-response.dummy.json'
import { MockType } from '../../utils/mock-type'

export const GoogleApisServiceMockFactory: () => MockType<GoogleApisService> = jest.fn(() => ({
  validateAddress: jest.fn(() => GoogleAddressValidationValidResponseDummy)
}))