import { QuestionnaireTargetService } from '../../../src/questionnaire-targets/questionnaire-target.service'
import { MockType } from '../../utils/mock-type'

export const questionnaireTargetServiceMockFactory: () => MockType<QuestionnaireTargetService> = jest.fn(() => ({
  create: jest.fn(entity => entity),
  findOne: jest.fn(entity => entity),
  update: jest.fn(entity => entity),
  remove: jest.fn(entity => entity),
  findByFilter: jest.fn(entity => entity)
}))