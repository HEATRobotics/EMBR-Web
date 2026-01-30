import { RobotOperationalStatusType } from './robotConstants';

describe('robotConstants', () => {
  describe('RobotOperationalStatusType', () => {
    describe('operational status', () => {
      it('should have correct colors and text for operational', () => {
        expect(RobotOperationalStatusType.operational).toEqual({
          color: '#035f25',
          bgColor: '#93FF9E',
          text: 'Operational',
        });
      });

      it('should have correct colors and text for chargingRequired', () => {
        expect(RobotOperationalStatusType.chargingRequired).toEqual({
          color: '#FBBF24',
          bgColor: '#FFFB93',
          text: 'Charging Required',
        });
      });

      it('should have correct colors and text for attentionRequired', () => {
        expect(RobotOperationalStatusType.attentionRequired).toEqual({
          color: '#EF4444',
          bgColor: '#FF9393',
          text: 'Attention Required',
        });
      });

      it('should have correct colors and text for systemFailed', () => {
        expect(RobotOperationalStatusType.systemFailed).toEqual({
          color: '#DC2626',
          bgColor: '#FE5555',
          text: 'System Failed',
        });
      });
    });

    describe('all status types existence', () => {
      it('should have all four status types defined', () => {
        expect(RobotOperationalStatusType).toHaveProperty('operational');
        expect(RobotOperationalStatusType).toHaveProperty('chargingRequired');
        expect(RobotOperationalStatusType).toHaveProperty('attentionRequired');
        expect(RobotOperationalStatusType).toHaveProperty('systemFailed');
      });

      it('should have color property for all statuses', () => {
        Object.values(RobotOperationalStatusType).forEach((status) => {
          expect(status).toHaveProperty('color');
          expect(typeof status.color).toBe('string');
        });
      });

      it('should have bgColor property for all statuses', () => {
        Object.values(RobotOperationalStatusType).forEach((status) => {
          expect(status).toHaveProperty('bgColor');
          expect(typeof status.bgColor).toBe('string');
        });
      });

      it('should have text property for all statuses', () => {
        Object.values(RobotOperationalStatusType).forEach((status) => {
          expect(status).toHaveProperty('text');
          expect(typeof status.text).toBe('string');
        });
      });
    });
  });
});
