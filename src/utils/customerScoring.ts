import { CustomerScoreTag } from '@/types/admin';

/**
 * Custom Algerian Customer Classification Algorithm for Pyjama Design
 * 
 * Rules:
 * - If (Confirmed - Cancelled) >= 5 -> Tag as 'BON_CLIENT' (Good Customer)
 * - If Confirmed <= Cancelled -> Tag as 'MAUVAIS_CLIENT' (Bad Customer / High Risk)
 * - Otherwise -> Tag as 'NORMAL' (Neutral)
 */
export function calculateCustomerScore(confirmed: number, cancelled: number): CustomerScoreTag {
  if (confirmed <= cancelled && (confirmed > 0 || cancelled > 0)) {
    return 'MAUVAIS_CLIENT';
  }
  if ((confirmed - cancelled) >= 5) {
    return 'BON_CLIENT';
  }
  return 'NORMAL';
}

export function getCustomerTagInfo(tag: CustomerScoreTag) {
  switch (tag) {
    case 'BON_CLIENT':
      return {
        labelAr: 'زبون ممتاز (Bon Client)',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dotClass: 'bg-emerald-500',
      };
    case 'MAUVAIS_CLIENT':
      return {
        labelAr: 'زبون مرتكب للمخاطر (Mauvais Client)',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        dotClass: 'bg-rose-500',
      };
    case 'NORMAL':
    default:
      return {
        labelAr: 'زبون عادي (Client Normal)',
        badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
        dotClass: 'bg-amber-500',
      };
  }
}
