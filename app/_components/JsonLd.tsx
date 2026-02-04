"use client";

import { useEffect } from "react";

interface JsonLdProps {
  data: object | object[];
}

export function JsonLd({ data }: JsonLdProps) {
  useEffect(() => {
    // Créer un script et l'ajouter au head
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    script.id = "json-ld-script";
    
    // Supprimer l'ancien script s'il existe
    const existing = document.getElementById("json-ld-script");
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup: supprimer le script quand le composant est démonté
      const scriptToRemove = document.getElementById("json-ld-script");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data]);

  return null;
}
