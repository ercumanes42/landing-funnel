import React from 'react';
import RadarWizardTalento from './RadarWizardTalento';
import RadarWizardAbsentismo from './RadarWizardAbsentismo';
import { getActiveFunnel } from '../utils/funnelSelector';

const RadarWizard: React.FC = () => {
  const activeFunnel = getActiveFunnel();

  if (activeFunnel === 'talento') {
    return <RadarWizardTalento />;
  }
  return <RadarWizardAbsentismo />;
};

export default RadarWizard;
