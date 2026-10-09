import { useNavigate } from 'react-router-dom';
import { useAlerts } from '@inithium/shared-data-access';
import { AlertStack } from '@inithium/shared-ui-composites';

/** The manual's global alerts (decision 0066), so live examples can show alerts from anywhere. */
export function DocsAlerts() {
  const navigate = useNavigate();
  const { stackProps } = useAlerts();
  return <AlertStack {...stackProps} onNavigate={(href) => navigate(href)} />;
}
