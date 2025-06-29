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
  image_url?: string;
  is_published: boolean;
}

interface Produit {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  shop_id: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'boutiques' | 'produits'>('boutiques');
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  const fetchBoutiques = async () => {
    try {
      const response = await fetch("http://localhost:8000/shops/retrieve-all-shops/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setBoutiques(data);
      } else {
        console.error("Erreur lors du chargement des boutiques");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  useEffect(() => {
    fetchBoutiques();
  }, [token]);

  const fetchProduitsByShop = async (shopId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/shops/${shopId}/products/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProduits(data);
      } else {
        console.error("Erreur lors du chargement des produits");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  useEffect(() => {
    if (selectedShopId) {
      fetchProduitsByShop(selectedShopId);
    } else {
      setProduits([]);
    }
  }, [selectedShopId, token]);

  const handleAddBoutique = (nouvelleBoutique: Boutique) => {
    setBoutiques((prev) => [...prev, nouvelleBoutique]);
  };

  const handlePublishToggle = async (id: string, publish: boolean) => {
    const endpoint = publish
      ? `http://localhost:8000/shops/publish/${id}`
      : `http://localhost:8000/shops/unpublish/${id}`;

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchBoutiques();
      } else {
        console.error("Erreur lors de la mise à jour de la boutique");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  const handleSubmitProduitSuccess = () => {
    if (selectedShopId) {
      fetchProduitsByShop(selectedShopId);
    }
  };

  const handleEditProduit = (produit: Produit) => {
    setEditingProductId(produit.id);
    const formCard = document.querySelector('.produit-form-card');
    formCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
  };

  const handleDeleteProduit = async (id: string) => {
    const confirmDelete = window.confirm("Voulez-vous vraiment supprimer ce produit ?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchProduitsByShop(selectedShopId);
      } else {
        console.error("Erreur lors de la suppression du produit");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
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
          <Button variant="outline" onClick={handleLogout}>Déconnexion</Button>
        </div>
        <p>Gérez vos boutiques et produits</p>
        <Button variant="outline" onClick={() => navigate('/shops')}>Voir toutes les boutiques</Button>
      </div>

      <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'boutiques' && (
        <div className="tab-content">
          <BoutiqueForm onAddBoutique={handleAddBoutique} />
          <BoutiquesList boutiques={boutiques} onPublishToggle={handlePublishToggle} />
        </div>
      )}

      {activeTab === 'produits' && (
        <div className="tab-content">
          <h3>Choisissez une boutique :</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {boutiques.map((boutique) => (
              <div
                key={boutique.id}
                className={`border rounded-lg p-4 cursor-pointer transition hover:shadow-lg ${selectedShopId === boutique.id ? 'bg-primary text-white' : 'bg-white'}`}
                onClick={() => setSelectedShopId(boutique.id)}
              >
                <h4 className="font-semibold text-lg">{boutique.name}</h4>
              </div>
            ))}
          </div>

          <ProduitForm
            boutiques={boutiques}
            selectedShopId={selectedShopId}
            setSelectedShopId={setSelectedShopId}
            onSuccess={handleSubmitProduitSuccess}
            editingProduct={editingProduct}
            onCancelEdit={handleCancelEdit}
          />

          {selectedShopId && (
            <ProduitsList
              produits={produits}
              onEdit={handleEditProduit}
              onDelete={handleDeleteProduit}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
