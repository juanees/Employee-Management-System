import { describe, expect, it } from 'vitest';
import { TravelService } from '../src/modules/travel/travel.service';

const startDate = new Date('2030-01-01T09:00:00.000Z').toISOString();
const endDate = new Date('2030-01-05T09:00:00.000Z').toISOString();

const payload = {
  employeeId: '11111111-1111-1111-1111-111111111111',
  origin: 'HQ',
  destination: 'Client Site',
  startDate,
  endDate,
  purpose: 'Implementation'
};

describe('TravelService', () => {
  it('creates travel requests in pending state', () => {
    const service = new TravelService();
    const request = service.create(payload);

    expect(request.status).toBe('pending_approval');
    expect(request.id).toBeDefined();
  });

  it('throws when end date is before start', () => {
    const service = new TravelService();
    expect(() =>
      service.create({
        ...payload,
        startDate,
        endDate: new Date('2029-01-01T00:00:00.000Z').toISOString()
      })
    ).toThrow('End date must be after start date');
  });

  it('updates travel status', () => {
    const service = new TravelService();
    const request = service.create(payload);
    const updated = service.updateStatus(request.id, {
      status: 'approved',
      approverComments: 'Looks good'
    });

    expect(updated?.status).toBe('approved');
    expect(updated?.approverComments).toBe('Looks good');
  });
});
