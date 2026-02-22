import { NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `Tu es l'assistant virtuel d'AuTrust, plateforme belge d'achat et de location de véhicules (voitures, motos, utilitaires). Tu réponds en français, de façon courte et utile. Tu peux aider sur : comment acheter ou vendre un véhicule, comment déposer une annonce, la vérification des vendeurs (email, téléphone, KYC), l'acompte sécurisé, la vérification CarVertical, les garages partenaires, les tarifs. Si tu ne sais pas ou si la question sort du cadre AuTrust, dis-le poliment et invite à contacter le support via la page Contact.`;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: "L'assistant IA n'est pas encore configuré (OPENAI_API_KEY). Posez vos questions via la page Contact en attendant.",
      });
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      max_tokens: 500,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "Désolé, je n'ai pas pu générer une réponse. Réessayez ou contactez-nous.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[chat]", err);
    return NextResponse.json(
      { reply: "Une erreur est survenue. Réessayez ou utilisez la page Contact." },
      { status: 200 }
    );
  }
}
