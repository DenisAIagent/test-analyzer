import { CampaignProvider } from './hooks/useCampaign';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <CampaignProvider>
      <Dashboard />
    </CampaignProvider>
  );
}

export default App;