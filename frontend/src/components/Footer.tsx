import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, MessageSquare, Mail, Phone, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Logo } from './Logo';

const Footer: React.FC = () => {
  const { toast } = useToast();
  const [suggestion, setSuggestion] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSuggestion(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/suggestions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestion),
      });
      if (!response.ok) throw new Error("L'envoi a échoué.");
      toast({ title: "Merci !", description: "Votre suggestion a bien été envoyée." });
      setSuggestion({ name: '', email: '', message: '' });
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="container px-4 sm:px-8 py-16 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12">
        {/* Colonne 1: Marque */}
        <div className="md:col-span-3 lg:col-span-1 space-y-4">
          <Link to="/" className="flex items-center group py-0.5" aria-label="Ahimin Accueil">
            <Logo variant="dark" className="h-10 w-auto group-hover:opacity-90 transition-opacity" />
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed">
            La marketplace locale nouvelle génération qui met en valeur vos commerçants de proximité et simplifie vos achats au quotidien.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 transition-all">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 transition-all">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 transition-all">
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Colonne 2: Formulaire Suggestion */}
        <div className="md:col-span-2 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <MessageSquare className="h-5 w-5 text-orange-500" />
            <span>Une suggestion ou une idée ?</span>
          </div>
          <p className="text-xs text-slate-400">Votre avis nous aide à améliorer la plateforme pour toute la communauté.</p>
          <form onSubmit={handleSubmitSuggestion} className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input 
                type="text" 
                name="name" 
                placeholder="Votre nom" 
                value={suggestion.name} 
                onChange={handleInputChange} 
                required
                className="bg-slate-900/90 border-slate-800 text-white placeholder:text-slate-500 focus:border-orange-500 rounded-xl h-11 text-sm"
              />
              <Input 
                type="email" 
                name="email" 
                placeholder="Votre adresse email" 
                value={suggestion.email} 
                onChange={handleInputChange} 
                required
                className="bg-slate-900/90 border-slate-800 text-white placeholder:text-slate-500 focus:border-orange-500 rounded-xl h-11 text-sm" 
              />
            </div>
            <Textarea 
              name="message" 
              placeholder="Écrivez votre message ou suggestion..." 
              value={suggestion.message} 
              onChange={handleInputChange} 
              required
              className="bg-slate-900/90 border-slate-800 text-white placeholder:text-slate-500 focus:border-orange-500 rounded-xl resize-none min-h-[90px] text-sm"
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl h-11 px-6 text-sm shadow-sm transition-all"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer mon message'}
            </Button>
          </form>
        </div>

        {/* Colonne 3: Contact & Liens */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Phone className="h-5 w-5 text-orange-500" />
            <span>Assistance</span>
          </div>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="mailto:contact@ahimin.com" className="flex items-center gap-2.5 text-slate-400 hover:text-orange-400 transition-colors">
                <Mail className="h-4 w-4 text-orange-500 shrink-0" />
                <span>contact@ahimin.com</span>
              </a>
            </li>
            <li>
              <Link to="/shops" className="flex items-center justify-between text-slate-400 hover:text-white transition-colors">
                <span>Explorer les boutiques</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </li>
            <li>
              <Link to="/products" className="flex items-center justify-between text-slate-400 hover:text-white transition-colors">
                <span>Catalogue des produits</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </li>
            <li>
              <Link to="/register" className="flex items-center justify-between text-slate-400 hover:text-white transition-colors">
                <span>Ouvrir ma boutique</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-slate-900 bg-slate-950/80 py-6">
        <div className="container px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Ahimin. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-slate-300 transition-colors">Accueil</Link>
            <Link to="/shops" className="hover:text-slate-300 transition-colors">Boutiques</Link>
            <Link to="/products" className="hover:text-slate-300 transition-colors">Produits</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
