import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import BoutiqueForm from '@/components/dashboard/BoutiqueForm';
import BoutiquesList from '@/components/dashboard/BoutiquesList';
import ProduitForm from '@/components/dashboard/ProduitForm';
import ProduitsList from '@/components/dashboard/ProduitsList';
import { Boutique, Order, Produit, ShopWithOrders } from '@/types';
import { OrdersList } from '@/components/dashboard/OrderList';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'boutiques' | 'produits' | 'commandes'>('boutiques');

  // --- États pour les boutiques ---
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [editingShop, setEditingShop] = useState<Boutique | null>(null);
  const boutiqueFormRef = useRef<HTMLDivElement>(null);
  const [groupedOrders, setGroupedOrders] = useState<ShopWithOrders[]>([]);
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shops/my-shops/`, {
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
  const handlePublishToggle = async (id: string, publish: boolean) => {
    const action = publish ? 'publier' : 'dépublier';
    if (!window.confirm(`Êtes-vous sûr de vouloir ${action} cette boutique ?`)) return;
    
    const endpoint = publish ? `/shops/publish/${id}` : `/shops/unpublish/${id}`;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) fetchBoutiques();
      else alert("Erreur lors de l'opération.");
    } catch (error) { console.error(error); }
  };

  const handleDeleteShop = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette boutique ? Ses produits seront aussi supprimés.")) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shops/delete-shop/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) fetchBoutiques();
      else alert("Erreur lors de la suppression.");
    } catch(error) { console.error(error); }
  };

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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shops/my-shops/${shopId}/products`, {
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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      alert("Produit supprimé.");
      fetchProduitsByShop(selectedShopId);
    } else {
      alert("Erreur lors de la suppression du produit.");
    }
  };
  
  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setGroupedOrders(await response.json());
    } catch (error) { console.error("Erreur chargement commandes:", error); }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'commandes') {
      fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  const handleStatusChange = async (orderId: string, shopId: string, newStatus: string) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard/orders/${orderId}/sub_orders/${shopId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: newStatus })
        });
        if (!response.ok) throw new Error("La mise à jour a échoué.");
        alert("Statut mis à jour !");
        fetchOrders(); // Rafraîchir
    } catch(error) {
        alert((error as Error).message);
    }
  };

  const merchantShopIds = boutiques.map(b => b._id);
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gérez vos boutiques et vos produits
          </h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
          <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {activeTab === 'boutiques' && (
          <div className="space-y-8">
            <div ref={boutiqueFormRef}>
              <BoutiqueForm 
                isEditing={!!editingShop}
                initialData={editingShop}
                onSuccess={handleBoutiqueFormSuccess}
                onCancelEdit={handleCancelBoutiqueEdit}
              />
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-semibold mb-6 text-foreground">Mes Boutiques</h2>
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
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-semibold mb-6 text-foreground">Gestion des Produits</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 text-foreground border-b border-orange-200 pb-2">
                    1. Choisissez une boutique
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {boutiques.map((boutique) => (
                      <Button 
                        key={boutique._id} 
                        variant={selectedShopId === boutique._id ? 'default' : 'outline'} 
                        onClick={() => setSelectedShopId(boutique._id)}
                        className={selectedShopId === boutique._id 
                          ? 'bg-gradient-to-r from-primary to-accent text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300'
                          : 'border-orange-200 text-foreground hover:bg-orange-50 hover:border-primary transition-all duration-300'
                        }
                      >
                        {boutique.name}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {selectedShopId ? (
                  <div ref={produitFormRef}>
                    <h3 className="text-lg font-medium mb-4 text-foreground border-b border-orange-200 pb-2">
                      {editingProduct ? '2. Modifier le produit' : '2. Ajouter un produit'}
                    </h3>
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
                  <div className="text-center text-muted-foreground py-16 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-dashed border-orange-200">
                    <p className="text-lg">Veuillez sélectionner une boutique pour voir et gérer ses produits.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      {activeTab === 'commandes' && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Mes Commandes Reçues</h2>
          <OrdersList
            groupedOrders={groupedOrders} 
            onStatusChange={handleStatusChange} 
          />
        </div>
      )}
      </div>
    </div>
  );
};

export default Dashboard;