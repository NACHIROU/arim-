import { useEffect, useRef } from 'react';

export const useClickOutside = (handler: () => void) => {
  const domNode = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const maybeHandler = (event: MouseEvent) => {
      // Si on clique et que le clic n'est PAS à l'intérieur du noeud référencé...
      if (domNode.current && !domNode.current.contains(event.target as Node)) {
        handler(); // ... alors on exécute la fonction pour fermer.
      }
    };

    document.addEventListener("mousedown", maybeHandler);

    return () => {
      document.removeEventListener("mousedown", maybeHandler);
    };
  }, [handler]);

  return domNode;
};