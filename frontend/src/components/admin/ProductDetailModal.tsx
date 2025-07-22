import React from 'react';
import { Produit } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { Trash2 } from 'lucide-react';


interface ProductDetailModalProps {
  product: Produit | null;
  isOpen: boolean;
  onClose: () => void;
  onProductDeleted: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose, onProductDeleted }) => {
  const { toast } = useToast();
  const token = localStorage.getItem('token');

  if (!product) return null;

  const handleDeleteProduct = async () => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le produit "${product.name}" ?`)) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${product._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de la suppression.");
      }
      toast({ title: "Succès ✅ ", description: "Produit supprimé avec Succès ✅ ." });
      onProductDeleted(); // Appelle la fonction pour rafraîchir et fermer
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  const imageUrl = (product.images && product.images.length > 0) 
    ? product.images[0] 
    : 'https://via.placeholder.com/400?text=Image+Indisponible';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            Vendu par {product.shop?.name || 'Boutique inconnue'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <img src={imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-md mb-4" />
          <p className="text-2xl font-bold text-primary">{product.price.toLocaleString('fr-FR')} FCFA</p>
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={handleDeleteProduct}>
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer ce produit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};