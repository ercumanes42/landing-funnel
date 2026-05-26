export const getActiveFunnel = (): 'talento' | 'absentismo' => {
  if (typeof window === 'undefined') return 'absentismo';

  // 1. Check current hash route
  const hash = window.location.hash || '';
  if (
    hash.includes('talento') || 
    hash.includes('radar-talento') || 
    hash.includes('resultado-talento') || 
    hash.includes('rrhh')
  ) {
    return 'talento';
  }
  if (
    hash.includes('absentismo') || 
    hash.includes('radar-absentismo') || 
    hash.includes('resultado-absentismo')
  ) {
    return 'absentismo';
  }

  // 2. Check query params in URL
  const params = new URLSearchParams(window.location.search);
  const funnelParam = params.get('funnel');
  if (funnelParam === 'talento' || funnelParam === 'rrhh') return 'talento';
  if (funnelParam === 'absentismo') return 'absentismo';

  // 3. Check hostname / domain
  const hostname = window.location.hostname;
  if (hostname.includes('rrhh') || hostname.includes('talento')) {
    return 'talento';
  }

  // Default is absentismo
  return 'absentismo';
};
