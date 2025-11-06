import { ObjectLiteral, Repository } from 'typeorm'
import { MockType } from '../../utils/mock-type'

export const RepositoryMockFactory: <T extends ObjectLiteral>() => MockType<Repository<T>> = jest.fn(() => ({
  findOne: jest.fn(entity => entity),
  findOneOrFail: jest.fn(entity => entity),
  find: jest.fn(entity => entity),
  create: jest.fn(entity => entity),
  save: jest.fn(entity => entity),
  update: jest.fn(entity => entity),
  connectionTestForTargetSystem: jest.fn(entity => entity),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  }))
}))
