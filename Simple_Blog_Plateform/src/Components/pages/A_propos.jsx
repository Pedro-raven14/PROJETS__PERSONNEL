import { Link } from "react-router-dom";
import { Code2, Coffee, Rocket } from "lucide-react";

const skills = [
  {
    icon: <Code2 size={22} />,
    title: "Ce que j'utilise",
    content: "React, TypeScript, Node, Postgres, Tailwind.",
  },
  {
    icon: <Coffee size={22} />,
    title: "Ce que j'aime",
    content: "Le code propre, les revues bienveillantes, un bon café.",
  },
  {
    icon: <Rocket size={22} />,
    title: "Mon objectif",
    content: "Devenir un développeur solide et utile à mon équipe.",
  },
];

export default function APropos() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Badge */}
      <span
        className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6"
        style={{
          backgroundColor: "var(--color-bg)",
          color: "var(--color-accent)",
          border: "1px solid var(--color-accent)",
        }}
      >
        À propos
      </span>

      {/* Titre */}
      <h1
        className="text-4xl sm:text-5xl font-black mb-4 leading-tight"
        style={{ color: "var(--color-text)" }}
      >
        Salut, moi c'est Alex 👋
      </h1>

      <p className="text-base leading-relaxed mb-10" style={{ color: "var(--color-text-muted)" }}>
        Développeur junior fullstack, j'écris ici pour partager ce que j'apprends au
        quotidien. Ce blog est autant un carnet de notes qu'une vitrine de mon travail.
      </p>

      {/* Cartes compétences */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {skills.map((skill) => (
          <div
            key={skill.title}
            className="rounded-xl p-5 flex flex-col gap-3"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text)",
              }}
            >
              {skill.icon}
            </div>
            <div>
              <p className="font-semibold text-sm mb-1" style={{ color: "var(--color-text)" }}>
                {skill.title}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {skill.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pourquoi ce blog */}
      <section className="mb-10">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "var(--color-text)" }}
        >
          Pourquoi ce blog ?
        </h2>
        <p className="text-base leading-relaxed mb-4" style={{ color: "var(--color-text-muted)" }}>
          J'ai commencé à écrire pour deux raisons : consolider ce que j'apprends,
          et donner en retour à la communauté qui m'a tant appris via ses articles et tutos.
        </p>
        <p className="text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          Récemment sorti de mes études en Systèmes Informatiques et Logiciel, je me lance
          dans le monde professionnel. Ce blog est à la fois mon journal de bord et
          une vitrine de mon parcours.
        </p>
      </section>

      {/* Ce que tu trouveras ici */}
      <section className="mb-10">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "var(--color-text)" }}
        >
          Ce que tu trouveras ici
        </h2>
        <p className="text-base leading-relaxed mb-4" style={{ color: "var(--color-text-muted)" }}>
          Des tutoriels courts, des retours d'expérience honnêtes, et parfois des billets plus
          personnels sur la vie de junior. Pas de recette miracle, pas de survente.
        </p>

        {/* Citation */}
        <blockquote
          className="border-l-4 pl-5 py-2 my-6 italic text-base"
          style={{
            borderColor: "var(--color-accent)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-muted)",
            borderRadius: "0 0.5rem 0.5rem 0",
          }}
        >
          "On n'apprend jamais aussi bien qu'en essayant d'expliquer à quelqu'un d'autre."
        </blockquote>
      </section>

      {/* CTA */}
      <div
        className="rounded-2xl p-8"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <h3 className="text-xl font-bold text-white mb-2">
          Une question, une remarque ?
        </h3>
        <p className="text-sm text-white/70 mb-5">
          Le meilleur moyen de me contacter est via les commentaires ou sur mes réseaux.
        </p>
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          Parcourir les catégories
        </Link>
      </div>
    </main>
  );
}
