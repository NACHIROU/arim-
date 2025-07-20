import React, { useEffect } from 'react';

const APIDataTester: React.FC = () => {
  useEffect(() => {
    const testApi = async () => {
      // --- VEUILLEZ METTRE L'ID D'UNE DE VOS BOUTIQUES QUI A DES PRODUITS ---
      const shopId = '686580efe7147a0d1622a6a7'; // Exemple avec l'ID de "Cadjav+"
      
      console.log(`--- TEST DIRECT DE L'API pour la boutique ${shopId} ---`);
      
      try {
        const response = await fetch(`http://localhost:8000/shops/${shopId}/products/`);
        const data = await response.json();

        console.log("--- RÉPONSE BRUTE REÇUE DE L'API ---");
        console.log(JSON.stringify(data, null, 2)); // Affiche le JSON brut

        if (data && data.length > 0) {
          console.log("--- VÉRIFICATION DÉTAILLÉE DU PREMIER PRODUIT ---");
          const firstProduct = data[0];
          console.log("L'objet produit a-t-il une propriété 'shop' ?", firstProduct.hasOwnProperty('shop'));
          
          if (firstProduct.shop) {
             console.log("L'objet 'shop' a-t-il une propriété 'id' ?", firstProduct.shop.hasOwnProperty('id'));
             console.log("Valeur de 'shop.id':", firstProduct.shop.id);
             console.log("Contenu de l'objet 'shop':", firstProduct.shop);
          } else {
             console.log("CONCLUSION : L'objet 'shop' est MANQUANT dans la réponse de l'API !");
          }
        }
      } catch (error) {
        console.error("L'appel à l'API a échoué :", error);
      }
    };
    testApi();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Test de l'API en cours...</h1>
      <p>Veuillez ouvrir la console de votre navigateur (F12) pour voir les résultats.</p>
    </div>
  );
};

export default APIDataTester;