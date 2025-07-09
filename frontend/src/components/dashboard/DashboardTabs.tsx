import React from 'react';
import { Button } from "@/components/ui/button";

interface DashboardTabsProps {
  activeTab: 'boutiques' | 'produits';
  setActiveTab: (tab: 'boutiques' | 'produits') => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="dashboard-tabs">
      <Button
        variant={activeTab === 'boutiques' ? 'default' : 'outline'}
        onClick={() => setActiveTab('boutiques')}
        className='border-0 '
      >
        Boutiques
      </Button>
      <Button
        variant={activeTab === 'produits' ? 'default' : 'outline'}
        onClick={() => setActiveTab('produits')}
        className='border-0 '
      >
        Produits
      </Button>
    </div>
  );
};

export default DashboardTabs;
