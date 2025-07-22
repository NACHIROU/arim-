
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Instagram, Twitter, Facebook, MessageSquare, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";

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
      setSuggestion({ name: '', email: '', message: '' }); // Vider le formulaire
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-amber-500/5"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
      
      <div className="relative container py-16 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12">
        
        {/* Colonne 1: Logo et description moderne */}
        <div className="md:col-span-3 lg:col-span-1">
          <Link to="/" className="flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="font-black text-2xl text-white">Ahimin</span>
          </Link>
          <p className="text-gray-300 leading-relaxed text-lg font-medium mb-8">
            La marketplace nouvelle génération qui révolutionne le commerce local et rapproche les communautés.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" aria-label="Facebook" className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-orange-500 transition-all duration-300 transform hover:scale-110">
              <Facebook className="h-5 w-5 text-white" />
            </a>
            <a href="#" aria-label="Instagram" className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-orange-500 transition-all duration-300 transform hover:scale-110">
              <Instagram className="h-5 w-5 text-white" />
            </a>
            <a href="#" aria-label="Twitter" className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-orange-500 transition-all duration-300 transform hover:scale-110">
              <Twitter className="h-5 w-5 text-white" />
            </a>
          </div>
        </div>

        {/* Colonne 2: Formulaire moderne */}
        <div className="md:col-span-2 lg:col-span-2">
          <h3 className="font-black mb-6 text-2xl flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            Une suggestion ? Écrivez-nous !
          </h3>
          <form onSubmit={handleSubmitSuggestion} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                type="text" 
                name="name" 
                placeholder="Nom et prénom" 
                value={suggestion.name} 
                onChange={handleInputChange} 
                required
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:bg-white/20 transition-all duration-300 rounded-xl h-12"
              />
              <Input 
                type="email" 
                name="email" 
                placeholder="Votre email" 
                value={suggestion.email} 
                onChange={handleInputChange} 
                required
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:bg-white/20 transition-all duration-300 rounded-xl h-12" 
              />
            </div>
            <Textarea 
              name="message" 
              placeholder="Votre message ou suggestion..." 
              value={suggestion.message} 
              onChange={handleInputChange} 
              required
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:bg-white/20 transition-all duration-300 resize-none min-h-[120px] rounded-xl"
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-0 rounded-xl h-12 px-8 font-bold transition-all duration-300 transform hover:scale-105"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
            </Button>
          </form>
        </div>

        {/* Colonne 3: Liens modernes */}
        <div className="lg:col-span-1">
          <h3 className="font-black mb-6 text-2xl flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
              <Phone className="h-4 w-4 text-white" />
            </div>
            Contact
          </h3>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-orange-500 transition-all duration-300">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <a href="mailto:contact@ahimin.com" className="text-gray-300 hover:text-white transition-colors font-medium">
                contact@ahimin.com
              </a>
            </li>
            <li className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-orange-500 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m12 16 4-4-4-4" />
                  <path d="M8 12h8" />
                </svg>
              </div>
              <a href="/faq" className="text-gray-300 hover:text-white transition-colors font-medium">
                FAQ
              </a>
            </li>
            <li className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-orange-500 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m12 16 4-4-4-4" />
                  <path d="M8 12h8" />
                </svg>
              </div>
              <a href="/terms" className="text-gray-300 hover:text-white transition-colors font-medium">
                Conditions d'utilisation
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-white/10">
        <div className="container py-6 text-center">
          <p className="text-gray-400 font-medium">
            © {new Date().getFullYear()} Ahimin. Tous droits réservés. Fais avec ❤️ pour les communautés locales.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
