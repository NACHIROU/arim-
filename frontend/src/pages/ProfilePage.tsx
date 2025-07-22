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
import { Loader2, User, Settings, ShoppingBag, Star, Lock, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { User as UserType, Order, Review } from '@/types'; 
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  first_name: z.string().min(2, "Le nom est trop court."),
  email: z.string().email("L'email est invalide."),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Mot de passe actuel requis."),
  new_password: z.string().min(8, "Le nouveau mot de passe doit faire au moins 8 caractères."),
});

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [archivedOrders, setArchivedOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  
  const token = localStorage.getItem('token');

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: '', email: '', phone: '' },
  });

  const fetchPrimaryData = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    try {
      const userRes = await fetch("${import.meta.env.VITE_API_BASE_URL}/users/me", { headers: { Authorization: `Bearer ${token}` } });
      if (!userRes.ok) throw new Error("Impossible de récupérer vos données.");
      const userData = await userRes.json();
      setUser(userData);
      profileForm.reset(userData);
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate, toast, profileForm]);

  useEffect(() => {
    fetchPrimaryData();
  }, [fetchPrimaryData]);
  
  const fetchOrders = async () => {
    setIsLoadingLists(true);
    try {
      const [activeRes, archivedRes] = await Promise.all([
        fetch("${import.meta.env.VITE_API_BASE_URL}/orders/my-orders?archived=false", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("${import.meta.env.VITE_API_BASE_URL}/orders/my-orders?archived=true", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (activeRes.ok) setActiveOrders(await activeRes.json());
      if (archivedRes.ok) setArchivedOrders(await archivedRes.json());
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les commandes.", variant: "destructive" });
    } finally {
      setIsLoadingLists(false);
    }
  };

  const fetchReviews = async () => {
    setIsLoadingLists(true);
    try {
      const res = await fetch("${import.meta.env.VITE_API_BASE_URL}/reviews/my-reviews", { headers: { Authorization: `Bearer ${token}` } });
      if(res.ok) setReviews(await res.json());
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les avis.", variant: "destructive" });
    } finally {
      setIsLoadingLists(false);
    }
  };
  
  const onTabChange = (value: string) => {
    if ((value === 'orders' && activeOrders.length === 0) || (value === 'archived' && archivedOrders.length === 0)) {
        fetchOrders();
    }
    if (value === 'reviews' && reviews.length === 0) {
        fetchReviews();
    }
  };

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', new_password: '' },
  });

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      const response = await fetch("${import.meta.env.VITE_API_BASE_URL}/users/me", {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour.");
      toast({ title: "Succès", description: "Votre profil a été mis à jour." });
      fetchPrimaryData();
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le profil.", variant: "destructive" });
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
     try {
      const response = await fetch("${import.meta.env.VITE_API_BASE_URL}/users/me/password", {
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

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("La suppression a échoué.");
      toast({ title: "Succès", description: "Votre avis a été supprimé." });
      fetchReviews();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleArchiveOrder = async (orderId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}/archive`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("L'archivage a échoué.");
      toast({ title: "Succès", description: "Commande archivée." });
      fetchOrders();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };
  
  const handleUnarchiveOrder = async (orderId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}/unarchive`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("La restauration a échoué.");
      toast({ title: "Succès", description: "Commande restaurée." });
      fetchOrders();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;


return (
    <div className="min-h-screen bg-slate-50">
      <div className="container max-w-6xl mx-auto py-12 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">Bonjour, {user?.first_name} 👋</h1>
            <p className="text-gray-600">Bienvenue dans votre espace personnel</p>
          </div>
          {user?.role === 'merchant' && (
            <Button asChild className="shadow-lg"><Link to="/dashboard"><Settings className="h-4 w-4 mr-2" />Accéder au Dashboard</Link></Button>
          )}
        </div>

        <Tabs defaultValue="profile" className="w-full" onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm shadow-sm h-12 rounded-lg">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary"><User className="h-4 w-4 mr-2" /> Mon Profil</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary"><ShoppingBag className="h-4 w-4 mr-2" /> Mes Commandes</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary"><Star className="h-4 w-4 mr-2" /> Mes Avis</TabsTrigger>
            <TabsTrigger value="archived" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary"><Archive className="h-4 w-4 mr-2" /> Commandes Archivées</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-lg"><CardHeader><CardTitle>Informations Personnelles</CardTitle></CardHeader><CardContent><Form {...profileForm}><form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4"><FormField control={profileForm.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>Nom</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={profileForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={profileForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Téléphone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><Button type="submit" disabled={profileForm.formState.isSubmitting}>Enregistrer</Button></form></Form></CardContent></Card>
              <Card className="shadow-lg"><CardHeader><CardTitle>Sécurité</CardTitle></CardHeader><CardContent><Form {...passwordForm}><form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4"><FormField control={passwordForm.control} name="current_password" render={({ field }) => (<FormItem><FormLabel>Actuel</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={passwordForm.control} name="new_password" render={({ field }) => (<FormItem><FormLabel>Nouveau</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} /><Button type="submit" disabled={passwordForm.formState.isSubmitting}>Changer</Button></form></Form></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card><CardHeader><CardTitle>Historique des Commandes</CardTitle></CardHeader><CardContent>{isLoadingLists ? <div className="text-center py-12"><Loader2 className="mx-auto h-6 w-6 animate-spin"/></div> : <div className="space-y-6">{activeOrders.length > 0 ? activeOrders.map(order => (<div key={order._id} className="border p-4 rounded-xl bg-white relative"><div className="flex justify-between items-start mb-4"><div><p className="font-semibold">Cde du {new Date(order.created_at).toLocaleDateString('fr-FR')}</p><p className="text-xs text-muted-foreground">ID: {order._id}</p></div><Badge>{order.status}</Badge></div><div className="absolute bottom-4 left-4"><Button variant="destructive" size="sm" onClick={() => handleArchiveOrder(order._id)}><Archive className="h-4 w-4 mr-2"/>Archiver</Button></div><div className="space-y-3 pr-28">{order.sub_orders.map(subOrder => (<div key={subOrder.shop_id}><p className="text-sm font-medium">Vendu par : {subOrder.shop_name}</p><ul className="list-disc pl-5 mt-1 text-sm space-y-1">{subOrder.products.map(product => (<li key={product.product_id} className="flex justify-between"><span>{product.name} (x{product.quantity})</span><span>{(product.price * product.quantity).toLocaleString('fr-FR')} FCFA</span></li>))}</ul></div>))}</div><Separator className="my-4" /><p className="text-right font-bold text-lg">Total : {order.total_price.toLocaleString('fr-FR')} FCFA</p></div>)) : <div className="text-center py-12"><ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" /><p>Aucune commande active.</p></div>}</div>}</CardContent></Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card><CardHeader><CardTitle>Avis Laissés</CardTitle></CardHeader><CardContent>{isLoadingLists ? <div className="text-center py-12"><Loader2 className="mx-auto h-6 w-6 animate-spin"/></div> : <div className="space-y-4">{reviews.length > 0 ? reviews.map(review => (<div key={review._id} className="border p-4 rounded-lg relative hover:bg-slate-50"><p className="text-sm font-semibold mb-1">Pour : <Link to={`/shops/${review.shop_details._id}`} className="text-primary hover:underline">{review.shop_details.name}</Link></p><div className="flex items-center mb-2">{[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}</div><p className="italic">"{review.message}"</p><Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => handleDeleteReview(review._id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div>)) : <div className="text-center py-12"><Star className="h-12 w-12 text-gray-300 mx-auto mb-4" /><p>Vous n'avez laissé aucun avis.</p></div>}</div>}</CardContent></Card>
          </TabsContent>
          
          <TabsContent value="archived" className="mt-6">

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">

              <CardHeader>

                <CardTitle className="text-gray-900">Commandes Archivées</CardTitle>

                <CardDescription className="text-gray-600">

                  Voici les commandes que vous avez masquées de votre historique principal.

                </CardDescription>

              </CardHeader>

              <CardContent className="space-y-6">

                {archivedOrders.length > 0 ? archivedOrders.map(order => (

                  <div key={order._id} className="border border-slate-200 p-6 rounded-xl bg-slate-100 relative opacity-70">

                    <div className="flex justify-between items-start mb-4">

                      <div className="space-y-1">

                        <p className="font-semibold text-gray-700">

                          Commande du {new Date(order.created_at).toLocaleDateString('fr-FR')}

                        </p>

                        <p className="text-xs text-gray-500">ID: {order._id}</p>

                      </div>

                      <Badge 

                        variant={order.status === 'Livrée' ? 'default' : 'secondary'} 

                        className="capitalize"

                      >

                        {order.status}

                      </Badge>

                    </div>


                    <div className="absolute bottom-4 left-4">

                      <Button

                        variant="outline"

                        size="sm"

                        onClick={() => handleUnarchiveOrder(order._id)}

                        title="Restaurer cette commande"

                      >

                        <ArchiveRestore className="h-4 w-4 mr-2"/> Restaurer

                      </Button>

                    </div>

                

                    {/* --- On ajoute les détails des produits ici --- */}

                    <div className="space-y-4 pr-32">

                      {order.sub_orders.map(subOrder => (

                        <div key={subOrder.shop_id} className="bg-white/60 rounded-lg p-4">

                          <p className="text-sm font-medium text-slate-600 mb-2">

                            Vendu par : {subOrder.shop_name}

                          </p>

                          <ul className="space-y-2">

                            {subOrder.products.map(product => (

                              <li key={product.product_id} className="flex justify-between items-center text-sm">

                                <span className="text-gray-600">{product.name} (x{product.quantity})</span>

                                <span className="font-medium text-gray-800">

                                  {(product.price * product.quantity).toLocaleString('fr-FR')} FCFA

                                </span>

                              </li>

                            ))}

                          </ul>

                        </div>

                      ))}

                    </div>

                    

                    <Separator className="my-4 bg-slate-200" />

                    <p className="text-right font-bold text-lg text-gray-700">

                      Total : {order.total_price.toLocaleString('fr-FR')} FCFA

                    </p>

                  </div>

                )) : (

                  <div className="text-center py-12">

                    <Archive className="h-12 w-12 text-gray-300 mx-auto mb-4" />

                    <p className="text-gray-500">Vous n'avez aucune commande archivée.</p>

                  </div>

                )}

              </CardContent>

            </Card>

          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;