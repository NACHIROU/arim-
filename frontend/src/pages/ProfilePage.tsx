import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Lock, Settings, ShoppingBag, Star } from 'lucide-react';
import { User as UserType, Order, Review } from '@/types'; 
import { Separator } from "@/components/ui/separator"; // <-- CORRECTION DE L'IMPORT
import { Badge } from "@/components/ui/badge"; // <-- CORRECTION DE L'IMPORT

// Schéma de validation pour le formulaire de profil
const profileSchema = z.object({
  first_name: z.string().min(2, "Le nom est trop court."),
  email: z.string().email("L'email est invalide."),
  phone: z.string().optional(),
});

// Schéma de validation pour le mot de passe
const passwordSchema = z.object({
  current_password: z.string().min(1, "Mot de passe actuel requis."),
  new_password: z.string().min(8, "Le nouveau mot de passe doit faire au moins 8 caractères."),
});

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<UserType | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('token');

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: '', email: '', phone: '' },
  });

  const fetchData = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    try {
      const [userRes, ordersRes, reviewsRes] = await Promise.all([
        fetch("http://localhost:8000/users/me", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8000/orders/my-orders", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8000/reviews/my-reviews", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!userRes.ok) throw new Error("Impossible de récupérer vos données.");

      const userData = await userRes.json();
      setUser(userData);
      profileForm.reset(userData);
      
      if(ordersRes.ok) setOrders(await ordersRes.json());
      if(reviewsRes.ok) setReviews(await reviewsRes.json());

    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate, toast, profileForm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', new_password: '' },
  });

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      const response = await fetch("http://localhost:8000/users/me", {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour.");
      toast({ title: "Succès", description: "Votre profil a été mis à jour." });
      fetchData();
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le profil.", variant: "destructive" });
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
     try {
      const response = await fetch("http://localhost:8000/users/me/password", {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
      });
       const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Erreur de mise à jour.");
      toast({ title: "Succès", description: "Votre mot de passe a été changé." });
      passwordForm.reset();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <div className="container max-w-6xl mx-auto py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Bonjour, {user?.first_name} 👋</h1>
          <p className="text-muted-foreground">Bienvenue dans votre espace personnel.</p>
        </div>
        {user?.role === 'merchant' && (
          <Button asChild><Link to="/dashboard"><Settings className="h-4 w-4 mr-2" />Accéder au Dashboard</Link></Button>
        )}
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />Mon Profil</TabsTrigger>
          <TabsTrigger value="orders"><ShoppingBag className="h-4 w-4 mr-2" />Mes Commandes</TabsTrigger>
          <TabsTrigger value="reviews"><Star className="h-4 w-4 mr-2" />Mes Avis</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader><CardTitle>Informations Personnelles</CardTitle></CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField control={profileForm.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>Nom complet</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={profileForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={profileForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Téléphone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <Button type="submit" disabled={profileForm.formState.isSubmitting}>Enregistrer</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Changer de Mot de Passe</CardTitle></CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField control={passwordForm.control} name="current_password" render={({ field }) => (<FormItem><FormLabel>Mot de passe actuel</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={passwordForm.control} name="new_password" render={({ field }) => (<FormItem><FormLabel>Nouveau mot de passe</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <Button type="submit" disabled={passwordForm.formState.isSubmitting}>Changer</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Historique des Commandes</CardTitle><CardDescription>Retrouvez ici la liste de tous vos achats.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              {orders.length > 0 ? orders.map(order => (
                <div key={order._id} className="border p-4 rounded-lg bg-slate-50/50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold">Commande du {new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                      <p className="text-xs text-muted-foreground">ID: {order._id}</p>
                    </div>
                    <Badge variant={order.status === 'Livrée' ? 'default' : 'secondary'} className="capitalize">{order.status}</Badge>
                  </div>
                  <div className="space-y-3">
                    {order.sub_orders.map(subOrder => (
                      <div key={subOrder.shop_id}>
                        <p className="text-sm font-medium text-muted-foreground">Vendu par : {subOrder.shop_name}</p>
                        <ul className="list-disc pl-5 mt-1 text-sm space-y-1">
                          {subOrder.products.map(product => (
                            <li key={product.product_id} className="flex justify-between">
                              <span>{product.name} (x{product.quantity})</span>
                              <span>{(product.price * product.quantity).toLocaleString('fr-FR')} FCFA</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <p className="text-right font-bold text-lg">Total : {order.total_price.toLocaleString('fr-FR')} FCFA</p>
                </div>
              )) : <p className="text-muted-foreground text-center py-8">Vous n'avez pas encore passé de commande.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Avis que vous avez laissés</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               {reviews.length > 0 ? reviews.map(review => (
                <div key={review._id} className="border p-4 rounded-lg">
                  <div className="flex items-center mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
                  </div>
                  <p className="italic text-muted-foreground">"{review.message}"</p>
                  <p className="text-xs text-muted-foreground mt-2">Le {new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              )) : <p className="text-muted-foreground text-center py-8">Vous n'avez laissé aucun avis.</p>}
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
};

export default ProfilePage;