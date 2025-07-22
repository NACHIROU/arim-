import React from 'react';
import { Button } from '@/components/ui/button';
import { Store, Package } from 'lucide-react';

interface DashboardTabsProps {
  activeTab: 'boutiques' | 'produits' | 'commandes';
  setActiveTab: (tab: 'boutiques' | 'produits' | 'commandes') => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex gap-2 bg-muted/30 p-2 rounded-xl center justify-center shadow-sm">
      <Button
        variant={activeTab === 'boutiques' ? 'default' : 'ghost'}
        onClick={() => setActiveTab('boutiques')}
        className={activeTab === 'boutiques' 
          ? ' from-primary to-accent text-white shadow-lg hover:shadow-xl transition-all duration-300'
          : 'text-foreground hover:bg-orange-50 hover:text-primary transition-all duration-300'
        }
      >
        <Store className="h-4 w-4 mr-2" />
        Boutiques
      </Button>
      <Button
        variant={activeTab === 'produits' ? 'default' : 'ghost'}
        onClick={() => setActiveTab('produits')}
        className={activeTab === 'produits' 
          ? ' from-primary to-accent text-white shadow-lg hover:shadow-xl transition-all duration-300'
          : 'text-foreground hover:bg-orange-50 hover:text-primary transition-all duration-300'
        }
      >
        <Package className="h-4 w-4 mr-2" />
        Produits
      </Button>
      <Button
        variant={activeTab === 'commandes' ? 'default' : 'ghost'}
        onClick={() => setActiveTab('commandes')}
        className={activeTab === 'commandes' 
          ? ' from-primary to-accent text-white shadow-lg hover:shadow-xl transition-all duration-300'
          : 'text-foreground hover:bg-orange-50 hover:text-primary transition-all duration-300'
        }
      >
        <Package className="h-4 w-4 mr-2" />
        Commandes
      </Button>
    </div>
  );
};

export default DashboardTabs;