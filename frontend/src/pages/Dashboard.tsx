import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import BoutiqueForm from '@/components/dashboard/BoutiqueForm';
import BoutiquesList from '@/components/dashboard/BoutiquesList';
import ProduitForm from '@/components/dashboard/ProduitForm';
import ProduitsList from '@/components/dashboard/ProduitsList';
import { Boutique, Produit } from '@/types'; // <-- On importe les types depuis le fichier central
import './Dashboard.css';

// On ne définit plus les interfaces ici.

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'boutiques' | 'produits'>('boutiques');
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingShop, setEditingShop] = useState<Boutique | null>(null);

  const token = localStorage.getItem('token');
  // Récupère les boutiques du marchand connecté

  const boutiqueFormRef = useRef<HTMLDivElement>(null);
  const fetchBoutiques = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/shops/my-shops/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setBoutiques(await response.json());
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      console.error("Erreur réseau (fetchBoutiques):", error);
    }
  };

  useEffect(() => {
    fetchBoutiques();
  }, []);

  // --- Définition des Actions pour les Boutiques ---

  const handlePublishToggle = async (id: string, publish: boolean) => {
    const action = publish ? 'publier' : 'dépublier';
    if (!window.confirm(`Êtes-vous sûr de vouloir ${action} cette boutique ?`)) return;
    
    const endpoint = publish ? `/shops/publish/${id}` : `/shops/unpublish/${id}`;
    const response = await fetch(`http://localhost:8000${endpoint}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) fetchBoutiques();
    else alert("Erreur lors de l'opération.");
  };

  const handleDeleteShop = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette boutique ?")) return;
    
    const response = await fetch(`http://localhost:8000/shops/delete-shop/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) fetchBoutiques();
    else alert("Erreur lors de la suppression.");
  };



  const handleEditShop = (id: string) => {
    const shopToEdit = boutiques.find(b => b._id === id);
    if (shopToEdit) {
      setEditingShop(shopToEdit); // On mémorise la boutique
      boutiqueFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); // On scrolle
    }
  };

  const handleFormSuccess = () => {
    setEditingShop(null); // On quitte le mode édition
    fetchBoutiques();     // On rafraîchit la liste
  };



  // --- Fonctions de gestion pour les produits ---

  const fetchProduitsByShop = async (shopId: string) => {
    if (!shopId || !token) {
      setProduits([]);
      return;
    }
    const response = await fetch(`http://localhost:8000/shops/${shopId}/products/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if(response.ok) setProduits(await response.json());
  };

  useEffect(() => {
    fetchProduitsByShop(selectedShopId);
  }, [selectedShopId]);

  const handleSubmitProduitSuccess = () => {
    if (selectedShopId) fetchProduitsByShop(selectedShopId);
  };

  const handleEditProduit = (produit: Produit) => {
    setEditingProductId(produit._id);
  };

  const handleCancelEdit = () => setEditingProductId(null);

  const handleDeleteProduit = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce produit ?")) return;
    // La route de suppression doit être sécurisée côté backend !
  const response = await fetch(`http://localhost:8000/products/products/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    if(response.ok) handleSubmitProduitSuccess();
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const editingProduct = produits.find(p => p._id === editingProductId) || null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Marchand</h1>
        <p>Gérez vos boutiques et produits.</p>
      </div>

      <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'boutiques' && (
        <div className="mt-6">
          <div ref={boutiqueFormRef}>
            <BoutiqueForm 
              isEditing={!!editingShop}
              initialData={editingShop}
              onSuccess={handleFormSuccess}
              onCancelEdit={handleCancelEdit}
            />
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Mes Boutiques</h2>
            <BoutiquesList
              boutiques={boutiques}
              onPublishToggle={handlePublishToggle}
              onEdit={handleEditShop}
              onDelete={handleDeleteShop}
            />
          </div>
        </div>
      )}
      {activeTab === 'produits' && (
        <div className="tab-content">
          <h2 className="text-2xl font-semibold mb-4">Mes Produits</h2>
           <ProduitForm
            boutiques={boutiques}
            selectedShopId={selectedShopId}
            setSelectedShopId={setSelectedShopId}
            onSuccess={handleSubmitProduitSuccess}
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