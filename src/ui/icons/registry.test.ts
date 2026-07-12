import { describe, it, expect } from 'vitest';
import { resolveFallbackIconKey } from './registry';
import { slotSchema, weaponTypeSchema } from '../../core/data/schema';

describe('resolveFallbackIconKey', () => {
  it('resolve cada tipo de arma para o ícone correspondente', () => {
    expect(resolveFallbackIconKey('weapon', 'sword')).toBe('sword');
    expect(resolveFallbackIconKey('weapon', 'axe')).toBe('axe');
    expect(resolveFallbackIconKey('weapon', 'bow')).toBe('bow');
    expect(resolveFallbackIconKey('weapon', 'mace')).toBe('mace');
  });

  it('cai no ícone genérico de arma quando o slot é weapon sem weaponType (slot vazio)', () => {
    expect(resolveFallbackIconKey('weapon')).toBe('weaponGeneric');
  });

  it('resolve cada slot não-arma para seu próprio ícone', () => {
    expect(resolveFallbackIconKey('offhand')).toBe('offhand');
    expect(resolveFallbackIconKey('helmet')).toBe('helmet');
    expect(resolveFallbackIconKey('chest')).toBe('chest');
    expect(resolveFallbackIconKey('gloves')).toBe('gloves');
    expect(resolveFallbackIconKey('boots')).toBe('boots');
    expect(resolveFallbackIconKey('wings')).toBe('wings');
    expect(resolveFallbackIconKey('ring')).toBe('ring');
    expect(resolveFallbackIconKey('amulet')).toBe('amulet');
  });

  it('cobre todos os slots e weaponTypes definidos no schema (sem lançar)', () => {
    for (const slot of slotSchema.options) {
      expect(() => resolveFallbackIconKey(slot)).not.toThrow();
    }
    for (const weaponType of weaponTypeSchema.options) {
      expect(() => resolveFallbackIconKey('weapon', weaponType)).not.toThrow();
    }
  });
});
