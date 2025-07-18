
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
import { Loader2, User, Settings, ShoppingBag, Star, Edit, Lock } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
          <p className="text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 to-amber-50/20">
      <div className="container max-w-6xl mx-auto py-12 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Bonjour, {user?.first_name} 👋
            </h1>
            <p className="text-gray-600">Bienvenue dans votre espace personnel</p>
          </div>
          {user?.role === 'merchant' && (
            <Button 
              asChild
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Link to="/dashboard">
                <Settings className="h-4 w-4 mr-2" />
                Accéder au Dashboard
              </Link>
            </Button>
          )}
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm shadow-sm border-0 h-12">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600"
            >
              <User className="h-4 w-4 mr-2" />
              Mon Profil
            </TabsTrigger>
            <TabsTrigger 
              value="orders"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Mes Commandes
            </TabsTrigger>
            <TabsTrigger 
              value="reviews"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600"
            >
              <Star className="h-4 w-4 mr-2" />
              Mes Avis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Edit className="h-5 w-5 text-orange-500" />
                    Informations Personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <FormField 
                        control={profileForm.control} 
                        name="first_name" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Nom complet</FormLabel>
                            <FormControl>
                              <Input {...field} className="border-orange-200 focus:border-orange-300 focus:ring-orange-200/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />
                      <FormField 
                        control={profileForm.control} 
                        name="email" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} className="border-orange-200 focus:border-orange-300 focus:ring-orange-200/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />
                      <FormField 
                        control={profileForm.control} 
                        name="phone" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Téléphone</FormLabel>
                            <FormControl>
                              <Input {...field} className="border-orange-200 focus:border-orange-300 focus:ring-orange-200/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />
                      <Button 
                        type="submit" 
                        disabled={profileForm.formState.isSubmitting}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all"
                      >
                        Enregistrer les modifications
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Lock className="h-5 w-5 text-orange-500" />
                    Changer de Mot de Passe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField 
                        control={passwordForm.control} 
                        name="current_password" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Mot de passe actuel</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} className="border-orange-200 focus:border-orange-300 focus:ring-orange-200/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />
                      <FormField 
                        control={passwordForm.control} 
                        name="new_password" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Nouveau mot de passe</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} className="border-orange-200 focus:border-orange-300 focus:ring-orange-200/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />
                      <Button 
                        type="submit" 
                        disabled={passwordForm.formState.isSubmitting}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all"
                      >
                        Changer le mot de passe
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Historique des Commandes</CardTitle>
                <CardDescription className="text-gray-600">
                  Retrouvez ici la liste de tous vos achats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {orders.length > 0 ? orders.map(order => (
                  <div key={order._id} className="border border-orange-100 p-6 rounded-xl bg-gradient-to-r from-orange-50/50 to-amber-50/30">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900">
                          Commande du {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-gray-500">ID: {order._id}</p>
                      </div>
                      <Badge 
                        variant={order.status === 'Livrée' ? 'default' : 'secondary'} 
                        className={`capitalize ${
                          order.status === 'Livrée' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      {order.sub_orders.map(subOrder => (
                        <div key={subOrder.shop_id} className="bg-white/50 rounded-lg p-4">
                          <p className="text-sm font-medium text-orange-600 mb-2">
                            Vendu par : {subOrder.shop_name}
                          </p>
                          <ul className="space-y-2">
                            {subOrder.products.map(product => (
                              <li key={product.product_id} className="flex justify-between items-center text-sm">
                                <span className="text-gray-700">{product.name} (x{product.quantity})</span>
                                <span className="font-medium text-gray-900">
                                  {(product.price * product.quantity).toLocaleString('fr-FR')} FCFA
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4 bg-orange-200/50" />
                    <p className="text-right font-bold text-lg text-gray-900">
                      Total : {order.total_price.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Vous n'avez pas encore passé de commande.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Avis que vous avez laissés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.length > 0 ? reviews.map(review => (
                  <div key={review._id} className="border border-orange-100 p-4 rounded-xl bg-gradient-to-r from-orange-50/50 to-amber-50/30">
                    <div className="flex items-center mb-2 gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
                            i < review.rating 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-gray-300 fill-gray-300'
                          }`} 
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-2">
                        Le {new Date(review.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="italic text-gray-700 leading-relaxed">
                      "{review.message}"
                    </p>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Vous n'avez laissé aucun avis.</p>
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
