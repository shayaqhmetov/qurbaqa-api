import { Test, TestingModule } from '@nestjs/testing';
import { ModuleService } from '../src/modules/module.service';
import { PrismaClientService } from '../src/clients/prisma.client';

const mockPrisma = {
  module: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  userModule: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
  },
};

describe('ModuleService', () => {
  let service: ModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleService,
        { provide: PrismaClientService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ModuleService>(ModuleService);
    jest.clearAllMocks();
  });

  it('should get all modules', async () => {
    mockPrisma.module.findMany.mockResolvedValue([{ id: '1', type: 'FINANCE' }]);
    const result = await service.getAllModules();
    expect(result).toEqual([{ id: '1', type: 'FINANCE' }]);
    expect(mockPrisma.module.findMany).toHaveBeenCalled();
  });

  it('should get user modules', async () => {
    mockPrisma.userModule.findMany.mockResolvedValue([{ id: '1', moduleId: '1', status: 'ACTIVE' }]);
    const result = await service.getUserModules('user1');
    expect(result).toEqual([{ id: '1', moduleId: '1', status: 'ACTIVE' }]);
    expect(mockPrisma.userModule.findMany).toHaveBeenCalledWith({
      where: { userId: 'user1', status: 'ACTIVE' },
      include: { module: true },
      orderBy: { attachedAt: 'desc' },
    });
  });

  it('should attach module to user', async () => {
    mockPrisma.module.findUnique.mockResolvedValue({ id: '1', type: 'FINANCE', isActive: true });
    mockPrisma.userModule.findUnique.mockResolvedValue(null);
    mockPrisma.userModule.upsert.mockResolvedValue({ id: '2', moduleId: '1', status: 'ACTIVE' });
    const result = await service.attachModule('user1', 'FINANCE');
    expect(result).toEqual({ id: '2', moduleId: '1', status: 'ACTIVE' });
    expect(mockPrisma.userModule.upsert).toHaveBeenCalled();
  });

  it('should not attach module if not found', async () => {
    mockPrisma.module.findUnique.mockResolvedValue(null);
    await expect(service.attachModule('user1', 'FINANCE')).rejects.toThrow('Module FINANCE not found');
  });

  it('should detach module from user', async () => {
    mockPrisma.module.findUnique.mockResolvedValue({ id: '1', type: 'FINANCE' });
    mockPrisma.userModule.findUnique.mockResolvedValue({ id: '2', moduleId: '1', status: 'ACTIVE' });
    mockPrisma.userModule.update.mockResolvedValue({ id: '2', moduleId: '1', status: 'INACTIVE' });
    const result = await service.detachModule('user1', 'FINANCE');
    expect(result).toEqual({ id: '2', moduleId: '1', status: 'INACTIVE' });
    expect(mockPrisma.userModule.update).toHaveBeenCalled();
  });

  it('should not detach module if not found', async () => {
    mockPrisma.module.findUnique.mockResolvedValue(null);
    await expect(service.detachModule('user1', 'FOOD')).rejects.toThrow('Module FOOD not found');
  });

  it('should not detach module if not attached', async () => {
    mockPrisma.module.findUnique.mockResolvedValue({ id: '1', type: 'FOOD' });
    mockPrisma.userModule.findUnique.mockResolvedValue(null);
    await expect(service.detachModule('user1', 'FOOD')).rejects.toThrow('Module FOOD not attached');
  });

  it('should check module access', async () => {
    mockPrisma.userModule.findFirst.mockResolvedValue({ id: '2', moduleId: '1', status: 'ACTIVE' });
    const result = await service.hasModuleAccess('user1', 'FINANCE');
    expect(result).toBe(true);
    mockPrisma.userModule.findFirst.mockResolvedValue(null);
    const result2 = await service.hasModuleAccess('user1', 'FOOD');
    expect(result2).toBe(false);
  });
});
