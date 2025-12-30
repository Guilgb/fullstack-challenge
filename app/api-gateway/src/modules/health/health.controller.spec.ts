import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe('check', () => {
    it('deve retornar status de saúde do serviço', () => {
      const beforeCheck = Date.now();
      const result = controller.check();
      const afterCheck = Date.now();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('service', 'api-gateway');
      expect(result).toHaveProperty('timestamp');

      const timestamp = new Date(result.timestamp).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(beforeCheck);
      expect(timestamp).toBeLessThanOrEqual(afterCheck);
    });

    it('deve retornar timestamp em formato ISO', () => {
      const result = controller.check();

      expect(() => new Date(result.timestamp)).not.toThrow();
      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it('deve sempre retornar status "ok"', () => {
      const result1 = controller.check();
      const result2 = controller.check();

      expect(result1.status).toBe('ok');
      expect(result2.status).toBe('ok');
    });
  });
});
