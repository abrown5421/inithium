import { useNavigate } from 'react-router-dom';
import { useAlerts } from '@inithium/shared-data-access';
import { AlertStack } from '@inithium/shared-ui-composites';

/** The CMS's AlertStack (decision 0066): render it once at the app's root, inside the router. */
export function CmsAlerts() {
  const navigate = useNavigate();
  const { stackProps } = useAlerts();
  return <AlertStack {...stackProps} onNavigate={(href) => navigate(href)} />;
}
