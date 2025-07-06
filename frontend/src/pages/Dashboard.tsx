import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import BoutiqueForm from '@/components/dashboard/BoutiqueForm';
import BoutiquesList from '@/components/dashboard/BoutiquesList';
import ProduitForm from '@/components/dashboard/ProduitForm';
import ProduitsList from '@/components/dashboard/ProduitsList';
import { Boutique, Produit } from '@/types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'boutiques' | 'produits'>('boutiques');
  
  // --- États pour les boutiques ---
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [editingShop, setEditingShop] = useState<Boutique | null>(null);
  const boutiqueFormRef = useRef<HTMLDivElement>(null);
  
  // --- États pour les produits ---
  const [produits, setProduits] = useState<Produit[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<Produit | null>(null);
  const produitFormRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem('token');

  // --- LOGIQUE COMMUNE ---
  const fetchBoutiques = async () => {
    if (!token) { navigate('/login'); return; }
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
    } catch (error) { console.error("Erreur réseau (fetchBoutiques):", error); }
  };

  useEffect(() => {
    fetchBoutiques();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // --- ACTIONS POUR LES BOUTIQUES ---
  const handlePublishToggle = async (id: string, publish: boolean) => { /* ... */ };
  const handleDeleteShop = async (id: string) => { /* ... */ };

  const handleEditShop = (id: string) => {
    const shopToEdit = boutiques.find(b => b._id === id);
    if (shopToEdit) {
      setEditingShop(shopToEdit);
      boutiqueFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBoutiqueFormSuccess = () => {
    setEditingShop(null);
    fetchBoutiques();
  };

  const handleCancelBoutiqueEdit = () => {
    setEditingShop(null);
  };

  // --- ACTIONS POUR LES PRODUITS ---
  const fetchProduitsByShop = async (shopId: string) => {
    if (!shopId || !token) { setProduits([]); return; }
    try {
      const response = await fetch(`http://localhost:8000/shops/${shopId}/products/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProduits(response.ok ? await response.json() : []);
    } catch (error) { console.error("Erreur chargement produits:", error); }
  };

  useEffect(() => {
    if (activeTab === 'produits' && boutiques.length > 0 && !selectedShopId) {
        setSelectedShopId(boutiques[0]._id);
    }
    if (selectedShopId) fetchProduitsByShop(selectedShopId);
  }, [selectedShopId, activeTab, boutiques]);

  const handleProduitFormSuccess = () => {
    setEditingProduct(null);
    if (selectedShopId) fetchProduitsByShop(selectedShopId);
  };

  const handleEditProduit = (produit: Produit) => {
    setEditingProduct(produit);
    produitFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCancelProduitEdit = () => {
    setEditingProduct(null);
  };

  const handleDeleteProduit = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce produit ?")) return;
    const response = await fetch(`http://localhost:8000/products/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      alert("Produit supprimé.");
      fetchProduitsByShop(selectedShopId);
    } else {
      alert("Erreur lors de la suppression du produit.");
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard Marchand</h1>
      </div>

      <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'boutiques' && (
        <div className="mt-6">
          <div ref={boutiqueFormRef}>
            <BoutiqueForm 
              isEditing={!!editingShop}
              initialData={editingShop}
              onSuccess={handleBoutiqueFormSuccess}
              onCancelEdit={handleCancelBoutiqueEdit}
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
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Gestion des Produits</h2>
          <div>
            <h3 className="text-lg font-medium mb-2">1. Choisissez une boutique</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
              {boutiques.map((boutique) => (
                <Button key={boutique._id} variant={selectedShopId === boutique._id ? 'default' : 'outline'} onClick={() => setSelectedShopId(boutique._id)}>
                  {boutique.name}
                </Button>
              ))}
            </div>
          </div>
          
          {selectedShopId ? (
            <div ref={produitFormRef}>
              <h3 className="text-lg font-medium mb-2">{editingProduct ? '2. Modifier le produit' : '2. Ajouter un produit'}</h3>
              <ProduitForm
                selectedShopId={selectedShopId}
                onSuccess={handleProduitFormSuccess}
                editingProduct={editingProduct}
                onCancelEdit={handleCancelProduitEdit}
                boutiques={boutiques}
              />
              <ProduitsList
                produits={produits}
                onEdit={handleEditProduit}
                onDelete={handleDeleteProduit}
              />
            </div>
          ) : (
            <p className="text-center text-muted-foreground mt-10">Veuillez sélectionner une boutique pour voir et gérer ses produits.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;