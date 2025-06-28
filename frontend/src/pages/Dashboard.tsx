import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import BoutiqueForm from '@/components/dashboard/BoutiqueForm';
import BoutiquesList from '@/components/dashboard/BoutiquesList';
import ProduitForm from '@/components/dashboard/ProduitForm';
import ProduitsList from '@/components/dashboard/ProduitsList';
import './Dashboard.css';

interface Boutique {
  id: string;
  name: string;
  description: string;
  location: string;
  // Ajoute d'autres champs si tu veux
}

interface Produit {
  id: number;
  nom: string;
  prix: number;
  image: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'boutiques' | 'produits'>('boutiques');
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchBoutiques = async () => {
      try {
        const response = await fetch("http://localhost:8000/shops/retrieve-all-shops/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("Erreur lors du chargement des boutiques");
          return;
        }

        const data = await response.json();
        setBoutiques(data);
      } catch (error) {
        console.error("Erreur réseau :", error);
      }
    };

    fetchBoutiques();
  }, [token]);

  const handleAddBoutique = (nouvelleBoutique: Boutique) => {
    setBoutiques([...boutiques, nouvelleBoutique]);
  };

  const handleSubmitProduit = (productData: Produit) => {
    if (editingProductId !== null) {
      setProduits(produits.map(p =>
        p.id === editingProductId ? { ...p, ...productData } : p
      ));
    } else {
      setProduits([...produits, { ...productData, id: Date.now() }]);
    }
    setEditingProductId(null);
  };

  const handleEditProduit = (produit: Produit) => {
    setEditingProductId(produit.id);
    const formCard = document.querySelector('.produit-form-card');
    formCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
  };

  const handleDeleteProduit = (id: number) => {
    setProduits(produits.filter(p => p.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const editingProduct = produits.find(p => p.id === editingProductId) || null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Dashboard Marchand</h1>
        </div>
        <p>Gérez vos boutiques et produits</p>
        <Button variant="outline" onClick={() => navigate('/shops')}>
          Voir toutes les boutiques
        </Button>
      </div>

      <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'boutiques' && (
        <div className="tab-content">
          <BoutiqueForm onAddBoutique={handleAddBoutique} />
          <BoutiquesList boutiques={boutiques} />
        </div>
      )}

      {activeTab === 'produits' && (
        <div className="tab-content">
          <ProduitForm
            onSubmit={handleSubmitProduit}
            editingProduct={editingProduct}
            onCancelEdit={handleCancelEdit}
          />
          <ProduitsList
            produits={produits}
            onEdit={handleEditProduit}
            onDelete={handleDeleteProduit}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
