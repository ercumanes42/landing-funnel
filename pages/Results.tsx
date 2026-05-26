import React from 'react';
import ResultsTalento from './ResultsTalento';
import ResultsAbsentismo from './ResultsAbsentismo';
import { getActiveFunnel } from '../utils/funnelSelector';

const Results: React.FC = () => {
  const activeFunnel = getActiveFunnel();

  if (activeFunnel === 'talento') {
    return <ResultsTalento />;
  }
  return <ResultsAbsentismo />;
};

export default Results;
