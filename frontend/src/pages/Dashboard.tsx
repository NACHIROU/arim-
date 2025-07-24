import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import BoutiqueForm from '@/components/dashboard/BoutiqueForm';
import BoutiquesList from '@/components/dashboard/BoutiquesList';
import ProduitForm from '@/components/dashboard/ProduitForm';
import ProduitsList from '@/components/dashboard/ProduitsList';
import { Boutique, Produit, ShopWithOrders } from '@/types';
import { OrdersList } from '@/components/dashboard/OrderList';
import { useToast } from "@/hooks/use-toast";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'boutiques' | 'produits' | 'commandes'>('boutiques');

  // États pour les boutiques
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [editingShop, setEditingShop] = useState<Boutique | null>(null);
  const boutiqueFormRef = useRef<HTMLDivElement>(null);
  
  // États pour les produits
  const [produits, setProduits] = useState<Produit[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<Produit | null>(null);
  const produitFormRef = useRef<HTMLDivElement>(null);

  // États pour les commandes
  const [groupedOrders, setGroupedOrders] = useState<ShopWithOrders[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("En attente");
  const token = localStorage.getItem('token');

  // --- Fonctions de chargement des données ---
  const fetchBoutiques = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shops/my-shops/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const shopsData = await response.json();
        setBoutiques(shopsData);
        if (shopsData.length > 0 && !selectedShopId) {
          setSelectedShopId(shopsData[0]._id);
        }
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) { console.error("Erreur réseau (fetchBoutiques):", error); }
  }, [token, navigate, selectedShopId]);

  useEffect(() => {
    fetchBoutiques();
  }, [fetchBoutiques]);

  const fetchProduitsByShop = useCallback(async (shopId: string) => {
    if (!shopId || !token) { setProduits([]); return; }
    try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shops/my-shops/${shopId}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProduits(response.ok ? await response.json() : []);
    } catch (error) { console.error("Erreur chargement produits:", error); }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'produits' && selectedShopId) {
      fetchProduitsByShop(selectedShopId);
    }
  }, [selectedShopId, activeTab, fetchProduitsByShop]);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    
    // --- On construit l'URL de manière plus simple ---
    const params = new URLSearchParams();
    params.append('status_filter', orderStatusFilter);
    
    const url = `${import.meta.env.VITE_API_BASE_URL}/dashboard/orders?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setGroupedOrders(await response.json());
    } catch (error) { console.error("Erreur chargement commandes:", error); }
  }, [token, orderStatusFilter])

  useEffect(() => {
    if (activeTab === 'commandes') {
      fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  
  // --- Fonctions de gestion (Handlers) ---
  const handleStatusChange = async (orderId: string, shopId: string, newStatus: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard/orders/${orderId}/sub_orders/${shopId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error("La mise à jour a échoué.");
      toast({ title: "Succès", description: "Statut mis à jour !" });
      fetchOrders();
    } catch(error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };
  
const handlePublishToggle = async (id: string, isPublished: boolean) => {
    const action = isPublished ? 'dépublier' : 'publier';
    if (!window.confirm(`Voulez-vous vraiment ${action} cette boutique ?`)) return;

    // --- On appelle la nouvelle route admin ---
    const endpoint = isPublished 
      ? `/shops/publish/${id}` 
      : `/shops/unpublish/${id}`;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method: "PATCH", 
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("L'opération a échoué.");
      toast({ title: "Succès", description: `Boutique ${action}e.` });
      fetchBoutiques();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleDeleteShop = async (id: string) => {
    if (!window.confirm("Supprimer cette boutique et tous ses produits ?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shops/delete-shop/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) fetchBoutiques();
      else toast({ title: "Erreur", description: "La suppression a échoué.", variant: "destructive" });
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
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`, {
            method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          toast({ title: "Succès", description: "Produit supprimé." });
          fetchProduitsByShop(selectedShopId);
        } else {
          toast({ title: "Erreur", description: "La suppression a échoué.", variant: "destructive" });
        }
    } catch (error) { console.error(error); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mon Tableau de Bord</h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 mb-8">
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
            <div>
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
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Gestion des Produits</h2>
              <Card>
                <CardHeader><CardTitle>1. Choisissez une boutique</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {boutiques.map((boutique) => (
                    <Button 
                      key={boutique._id} 
                      variant={selectedShopId === boutique._id ? 'default' : 'outline'} 
                      onClick={() => setSelectedShopId(boutique._id)}
                    >
                      {boutique.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
            {selectedShopId ? (
              <div ref={produitFormRef}>
                <h3 className="text-xl font-semibold mb-4">{editingProduct ? '2. Modifier le produit' : '2. Ajouter un produit'}</h3>
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <ProduitForm
                      selectedShopId={selectedShopId}
                      onSuccess={handleProduitFormSuccess}
                      editingProduct={editingProduct}
                      onCancelEdit={handleCancelProduitEdit}
                      boutiques={boutiques}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <ProduitsList
                      produits={produits}
                      onEdit={handleEditProduit}
                      onDelete={handleDeleteProduit}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-16">Veuillez sélectionner une boutique.</p>
            )}
          </div>
        )}
        
        {activeTab === 'commandes' && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Mes Commandes Reçues</h2>
                <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En attente">En attente</SelectItem>
                    <SelectItem value="En cours de livraison">En cours de livraison</SelectItem>
                    <SelectItem value="Livrée">Commandes livrées</SelectItem>
                    <SelectItem value="Annulée">Commandes annulées</SelectItem>
                    <SelectItem value="toutes">Toutes les commandes</SelectItem>
                  </SelectContent>
                </Select>
            </div>
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