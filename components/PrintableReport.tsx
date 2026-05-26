import React from 'react';
import PrintableReportTalento from './PrintableReportTalento';
import PrintableReportAbsentismo from './PrintableReportAbsentismo';
import { getActiveFunnel } from '../utils/funnelSelector';
import { ResultData } from '../types';

interface PrintableReportProps {
  results: ResultData;
}

const PrintableReport: React.FC<PrintableReportProps> = ({ results }) => {
  const activeFunnel = getActiveFunnel();

  if (activeFunnel === 'talento') {
    return <PrintableReportTalento results={results} />;
  }
  return <PrintableReportAbsentismo results={results} />;
};

export default PrintableReport;
