import React from 'react';
import LandingTalento from './LandingTalento';
import LandingAbsentismo from './LandingAbsentismo';
import { getActiveFunnel } from '../utils/funnelSelector';

const Landing: React.FC = () => {
  const activeFunnel = getActiveFunnel();

  if (activeFunnel === 'talento') {
    return <LandingTalento />;
  }
  return <LandingAbsentismo />;
};

export default Landing;
