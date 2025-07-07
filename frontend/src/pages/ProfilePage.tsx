import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, User, Mail, Phone, Lock, Settings } from 'lucide-react';
import { User as UserType } from '@/types'; 
import { Separator } from "@/components/ui/separator";

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
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchUserData = async () => {
    if (!token) { navigate('/login'); return; }
    try {
      const response = await fetch("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Impossible de récupérer les données de l'utilisateur.");
      const data = await response.json();
      setUser(data);
      profileForm.reset(data); // Pré-remplir le formulaire
    } catch (error) {
      console.error(error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // --- Configuration des formulaires ---
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: '', email: '', phone: '' },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', new_password: '' },
  });

  // --- Logique de soumission ---
  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      const response = await fetch("http://localhost:8000/users/me", {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour.");
      toast({ title: "Succès ✅ ", description: "Votre profil a été mis à jour." });
      fetchUserData(); // Rafraîchir les données
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
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* En-tête avec avatar et informations utilisateur */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Bonjour, {user?.first_name || 'Utilisateur'} 👋
                </h1>
                <p className="text-gray-600 text-lg">
                  Gérez vos informations personnelles et vos préférences de compte
                </p>
                {user?.role === 'merchant' && (
                  <div className="mt-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      <Settings className="h-4 w-4 mr-1" />
                      Compte Marchand
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-orange-500" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user?.role === 'merchant' && (
                  <Link to="/dashboard" className="block">
                    <Button className="w-full bg-orange-500 from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                      <Settings className="h-4 w-4 mr-2" />
                      Dashboard Marchand
                    </Button>
                  </Link>
                )}
                <Separator className="my-4" />
                <div className="text-sm text-gray-500 space-y-2">
                  <p className="font-medium">Prochainement :</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Mes commandes</li>
                    <li>• Mes avis</li>
                    <li>• Historique</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Informations Personnelles */}
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-orange-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <User className="h-6 w-6 mr-3" />
                  Informations Personnelles
                </CardTitle>
                <CardDescription className="text-orange-100">
                  Mettez à jour vos informations de contact et vos données personnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <FormField 
                      control={profileForm.control} 
                      name="first_name" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium flex items-center">
                            <User className="h-4 w-4 mr-2 text-orange-500" />
                            Nom complet
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="border-orange-200 focus:border-orange-400 focus:ring-orange-300 transition-colors" 
                              placeholder="Votre nom complet"
                            />
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
                          <FormLabel className="text-gray-700 font-medium flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-orange-500" />
                            Adresse email
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              {...field} 
                              className="border-orange-200 focus:border-orange-400 focus:ring-orange-300 transition-colors"
                              placeholder="votre@email.com"
                            />
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
                          <FormLabel className="text-gray-700 font-medium flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-orange-500" />
                            Numéro de téléphone
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="border-orange-200 focus:border-orange-400 focus:ring-orange-300 transition-colors"
                              placeholder="+33 1 23 45 67 89"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} 
                    />
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        disabled={profileForm.formState.isSubmitting}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {profileForm.formState.isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          'Enregistrer les modifications'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Changement de Mot de Passe */}
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-orange-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <Lock className="h-6 w-6 mr-3" />
                  Sécurité du Compte
                </CardTitle>
                <CardDescription className="text-red-100">
                  Modifiez votre mot de passe pour sécuriser votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField 
                      control={passwordForm.control} 
                      name="current_password" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium flex items-center">
                            <Lock className="h-4 w-4 mr-2 text-red-500" />
                            Mot de passe actuel
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              {...field} 
                              className="border-orange-200 focus:border-red-400 focus:ring-red-300 transition-colors"
                              placeholder="Votre mot de passe actuel"
                            />
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
                          <FormLabel className="text-gray-700 font-medium flex items-center">
                            <Lock className="h-4 w-4 mr-2 text-red-500" />
                            Nouveau mot de passe
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              {...field} 
                              className="border-orange-200 focus:border-red-400 focus:ring-red-300 transition-colors"
                              placeholder="Minimum 8 caractères"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} 
                    />
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        disabled={passwordForm.formState.isSubmitting}
                        className="bg-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {passwordForm.formState.isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Modification...
                          </>
                        ) : (
                          'Changer le mot de passe'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
