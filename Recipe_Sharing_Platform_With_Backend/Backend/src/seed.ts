/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SEED — seed.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Script d'initialisation de la base de données avec les données de démo.
 * Équivalent de initializeStorage() du frontend, mais pour PostgreSQL.
 *
 * COMMENT L'EXÉCUTER :
 *   npx ts-node -r tsconfig-paths/register src/seed.ts
 *
 * Ce script :
 * 1. Se connecte à PostgreSQL via TypeORM
 * 2. Crée les utilisateurs de démo (mots de passe hachés avec bcrypt)
 * 3. Crée les recettes de démo liées aux utilisateurs
 * 4. Crée les commentaires et notes de démo
 * 5. Se déconnecte proprement
 *
 * Il est IDEMPOTENT : on peut le relancer sans créer de doublons
 * (il vérifie d'abord si les données existent déjà).
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement depuis .env
dotenv.config();

// Importer les entités
import { User } from './users/user.entity';
import { Recipe } from './recipes/recipe.entity';
import { Comment } from './comments/comment.entity';
import { Rating } from './ratings/rating.entity';
import { Favorite } from './favorites/favorite.entity';

// ─── CONNEXION TYPEORM ────────────────────────────────────────────────────────

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || ''),
  database: process.env.DB_NAME || 'cookshare',
  entities: [User, Recipe, Comment, Rating, Favorite],
  synchronize: true, // Crée les tables si elles n'existent pas
});

// ─── DONNÉES DE DÉMO ──────────────────────────────────────────────────────────

const DEMO_USERS = [
  {
    fullName: 'Chef Amélie',
    username: 'chefamelie',
    email: 'amelie@example.com',
    password: 'demo1234',
    bio: 'Passionnée de cuisine française depuis toujours 🍞',
  },
  {
    fullName: 'Marc Dubois',
    username: 'marcdubois',
    email: 'marc@example.com',
    password: 'demo1234',
    bio: 'Chef amateur, fan de cuisine du monde',
  },
  {
    fullName: 'Yuki Tanaka',
    username: 'yukitanaka',
    email: 'yuki@example.com',
    password: 'demo1234',
    bio: 'Cuisine japonaise et asiatique ✨',
  },
  {
    fullName: 'Sophie Martin',
    username: 'sophiemartin',
    email: 'sophie@example.com',
    password: 'demo1234',
    bio: 'Pâtissière du dimanche 🍰',
  },
  {
    fullName: 'Luca Romano',
    username: 'lucaromano',
    email: 'luca@example.com',
    password: 'demo1234',
    bio: 'Pizza & pasta, c\'est la vita! 🍕',
  },
];

// Les recettes sont définies avec authorIndex (index dans DEMO_USERS)
const DEMO_RECIPES = [
  {
    authorIndex: 0,
    title: 'Tarte tatin aux pommes caramélisées',
    description: 'Un classique français revisité avec des pommes fondantes et un caramel doré. Simple, élégant et irrésistible.',
    category: 'Dessert',
    difficulty: 'Moyen',
    prepTime: 30,
    cookTime: 15,
    servings: 6,
    emoji: '🥧',
    bgColor: '#FFF3CD',
    rating: 4.8,
    ratingsCount: 42,
    tags: ['dessert', 'français', 'pommes'],
    ingredients: [
      { quantity: '6', unit: 'unités', name: 'pommes Golden' },
      { quantity: '150', unit: 'g', name: 'sucre' },
      { quantity: '80', unit: 'g', name: 'beurre demi-sel' },
      { quantity: '1', unit: 'rouleau', name: 'pâte feuilletée' },
      { quantity: '1', unit: 'c.à.c', name: 'vanille en poudre' },
    ],
    instructions: [
      'Préchauffer le four à 180°C.',
      'Dans une poêle allant au four, faire fondre le beurre à feu moyen.',
      'Ajouter le sucre et laisser caraméliser jusqu\'à obtenir une couleur dorée.',
      'Disposer les pommes pelées et coupées en quartiers sur le caramel.',
      'Couvrir avec la pâte feuilletée en rentrant les bords.',
      'Enfourner 25 minutes jusqu\'à ce que la pâte soit dorée.',
      'Démouler tiède et servir avec de la crème fraîche.',
    ],
    status: 'published' as const,
  },
  {
    authorIndex: 1,
    title: 'Buddha bowl végétarien aux légumes rôtis',
    description: 'Un bol coloré, équilibré et plein de saveurs pour un déjeuner sain. Riche en protéines et vitamines.',
    category: 'Déjeuner',
    difficulty: 'Facile',
    prepTime: 15,
    cookTime: 10,
    servings: 2,
    emoji: '🥗',
    bgColor: '#D1FAE5',
    rating: 4.6,
    ratingsCount: 38,
    tags: ['végétarien', 'healthy', 'rapide'],
    ingredients: [
      { quantity: '200', unit: 'g', name: 'quinoa' },
      { quantity: '1', unit: 'unité', name: 'patate douce' },
      { quantity: '200', unit: 'g', name: 'pois chiches en boîte' },
      { quantity: '1', unit: 'unité', name: 'avocat' },
      { quantity: '2', unit: 'poignées', name: 'épinards frais' },
      { quantity: '2', unit: 'c.à.s', name: 'tahini' },
      { quantity: '1', unit: 'unité', name: 'citron' },
    ],
    instructions: [
      'Cuire le quinoa selon les instructions du paquet.',
      'Couper la patate douce en cubes, les rôtir au four 25 min à 200°C avec un filet d\'huile.',
      'Égoutter les pois chiches, les faire dorer à la poêle avec du cumin.',
      'Préparer la sauce tahini : mélanger tahini, jus de citron, ail et eau.',
      'Assembler le bol : quinoa, légumes rôtis, avocat tranché, épinards.',
      'Arroser de sauce tahini et servir.',
    ],
    status: 'published' as const,
  },
  {
    authorIndex: 2,
    title: 'Ramen japonais traditionnel au porc',
    description: 'Le vrai ramen comme à Tokyo, avec un bouillon riche et parfumé mijoté pendant des heures.',
    category: 'Dîner',
    difficulty: 'Difficile',
    prepTime: 60,
    cookTime: 240,
    servings: 4,
    emoji: '🍜',
    bgColor: '#FEE2E2',
    rating: 4.9,
    ratingsCount: 67,
    tags: ['japonais', 'ramen', 'porc'],
    ingredients: [
      { quantity: '1', unit: 'kg', name: 'os de porc' },
      { quantity: '400', unit: 'g', name: 'poitrine de porc' },
      { quantity: '4', unit: 'portions', name: 'nouilles ramen fraîches' },
      { quantity: '4', unit: 'unités', name: 'oeufs' },
      { quantity: '2', unit: 'c.à.s', name: 'sauce soja' },
      { quantity: '1', unit: 'morceau', name: 'gingembre frais' },
      { quantity: '4', unit: 'gousses', name: 'ail' },
    ],
    instructions: [
      'Blanchir les os 5 minutes, rincer et remettre dans une grande casserole.',
      'Couvrir d\'eau froide, ajouter gingembre et ail, mijoter 4h à feu doux.',
      'Faire mariner la poitrine de porc dans sauce soja + mirin 30 min.',
      'Cuire la poitrine de porc roulée au four 1h à 160°C.',
      'Faire cuire les oeufs 6 minutes, les écaler et les mariner dans sauce soja.',
      'Cuire les nouilles selon le paquet.',
      'Assembler : bouillon chaud, nouilles, tranches de porc, oeuf coupé, ciboule.',
    ],
    status: 'published' as const,
  },
  {
    authorIndex: 3,
    title: 'Pancakes moelleux à la myrtille',
    description: 'Des pancakes ultra-moelleux avec des myrtilles fraîches. Le petit-déjeuner idéal du week-end.',
    category: 'Petit-déjeuner',
    difficulty: 'Facile',
    prepTime: 15,
    cookTime: 10,
    servings: 4,
    emoji: '🥞',
    bgColor: '#EDE9FE',
    rating: 4.7,
    ratingsCount: 55,
    tags: ['petit-déjeuner', 'sucré', 'fruits'],
    ingredients: [
      { quantity: '200', unit: 'g', name: 'farine' },
      { quantity: '2', unit: 'c.à.c', name: 'levure chimique' },
      { quantity: '2', unit: 'c.à.s', name: 'sucre' },
      { quantity: '240', unit: 'ml', name: 'lait' },
      { quantity: '2', unit: 'unités', name: 'oeufs' },
      { quantity: '30', unit: 'g', name: 'beurre fondu' },
      { quantity: '150', unit: 'g', name: 'myrtilles fraîches' },
    ],
    instructions: [
      'Mélanger les ingrédients secs : farine, levure, sucre, sel.',
      'Dans un autre bol, fouetter lait, oeufs et beurre fondu.',
      'Incorporer les liquides aux secs sans trop mélanger.',
      'Ajouter délicatement les myrtilles.',
      'Cuire à la poêle chaude légèrement beurrée, 2-3 min par face.',
      'Servir avec sirop d\'érable et myrtilles fraîches.',
    ],
    status: 'published' as const,
  },
  {
    authorIndex: 4,
    title: 'Pizza napolitaine à la mozzarella di bufala',
    description: 'Pâte fine, tomates San Marzano et basilic frais. La vraie pizza napolitaine à la maison.',
    category: 'Dîner',
    difficulty: 'Moyen',
    prepTime: 30,
    cookTime: 90,
    servings: 2,
    emoji: '🍕',
    bgColor: '#FFEDD5',
    rating: 4.8,
    ratingsCount: 73,
    tags: ['italien', 'pizza', 'classique'],
    ingredients: [
      { quantity: '300', unit: 'g', name: 'farine type 00' },
      { quantity: '7', unit: 'g', name: 'levure boulangère sèche' },
      { quantity: '200', unit: 'ml', name: 'eau tiède' },
      { quantity: '400', unit: 'g', name: 'tomates San Marzano' },
      { quantity: '200', unit: 'g', name: 'mozzarella di bufala' },
      { quantity: '1', unit: 'poignée', name: 'basilic frais' },
    ],
    instructions: [
      'Dissoudre la levure dans l\'eau tiède, attendre 5 min.',
      'Mélanger farine et sel, creuser un puits, ajouter le mélange eau-levure.',
      'Pétrir 10 minutes jusqu\'à pâte lisse, laisser lever 2h.',
      'Écraser les tomates à la main, assaisonner avec sel et huile.',
      'Étaler la pâte très finement sur la plaque.',
      'Garnir de sauce tomate, enfourner 5 min à 250°C.',
      'Ajouter mozzarella, re-enfourner 3-4 min, terminer avec basilic frais.',
    ],
    status: 'published' as const,
  },
  {
    authorIndex: 1,
    title: 'Smoothie bowl açaï tropical',
    description: 'Un bol frais et vitaminé à base d\'açaï, mangue et fruits tropicaux. Parfait pour bien démarrer la journée.',
    category: 'Petit-déjeuner',
    difficulty: 'Facile',
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    emoji: '🍓',
    bgColor: '#CFFAFE',
    rating: 4.5,
    ratingsCount: 29,
    tags: ['healthy', 'vegan', 'tropical'],
    ingredients: [
      { quantity: '100', unit: 'g', name: 'pulpe d\'açaï congelée' },
      { quantity: '100', unit: 'g', name: 'mangue congelée' },
      { quantity: '1', unit: 'unité', name: 'banane' },
      { quantity: '100', unit: 'ml', name: 'lait de coco' },
    ],
    instructions: [
      'Mixer la pulpe d\'açaï, mangue, banane et lait de coco jusqu\'à consistance épaisse.',
      'Verser dans un bol.',
      'Décorer avec granola, fruits frais, noix de coco râpée.',
      'Servir immédiatement.',
    ],
    status: 'published' as const,
  },
  {
    authorIndex: 0,
    title: 'Bœuf bourguignon mijoté à l\'ancienne',
    description: 'Un plat traditionnel qui mijote lentement pour développer toutes ses saveurs. Réconfortant et généreux.',
    category: 'Dîner',
    difficulty: 'Difficile',
    prepTime: 45,
    cookTime: 180,
    servings: 6,
    emoji: '🍲',
    bgColor: '#374151',
    rating: 4.9,
    ratingsCount: 91,
    tags: ['français', 'mijoté', 'bœuf'],
    ingredients: [
      { quantity: '1.5', unit: 'kg', name: 'bœuf à bourguignon' },
      { quantity: '1', unit: 'bouteille', name: 'vin rouge de Bourgogne' },
      { quantity: '200', unit: 'g', name: 'lardons' },
      { quantity: '300', unit: 'g', name: 'champignons de Paris' },
      { quantity: '2', unit: 'unités', name: 'carottes' },
      { quantity: '2', unit: 'unités', name: 'oignons' },
    ],
    instructions: [
      'Couper la viande en gros cubes, faire mariner dans le vin avec les légumes 12h.',
      'Égoutter la viande, la sécher et faire revenir en cocotte jusqu\'à dorure.',
      'Faire revenir lardons et légumes dans la même cocotte.',
      'Remettre la viande, ajouter la marinade et le bouquet garni.',
      'Couvrir et mijoter à feu très doux pendant 3h.',
      'Ajouter les champignons 30 min avant la fin.',
    ],
    status: 'published' as const,
  },
  {
    authorIndex: 0,
    title: 'Salade César au poulet grillé',
    description: 'Croquante, savoureuse et parfaite pour un déjeuner rapide. La salade César maison bien meilleure que partout.',
    category: 'Déjeuner',
    difficulty: 'Facile',
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    emoji: '🌮',
    bgColor: '#FEF3C7',
    rating: 4.4,
    ratingsCount: 36,
    tags: ['salade', 'poulet', 'rapide'],
    ingredients: [
      { quantity: '2', unit: 'filets', name: 'poulet' },
      { quantity: '1', unit: 'tête', name: 'laitue romaine' },
      { quantity: '50', unit: 'g', name: 'parmesan râpé' },
      { quantity: '2', unit: 'c.à.s', name: 'mayonnaise' },
      { quantity: '1', unit: 'c.à.s', name: 'jus de citron' },
    ],
    instructions: [
      'Mariner les filets de poulet avec huile, ail, citron, sel et poivre.',
      'Griller le poulet 6-7 min par face, laisser reposer et couper en tranches.',
      'Couper le pain en cubes, les faire dorer à la poêle avec ail et huile.',
      'Préparer la sauce : mayonnaise, citron, Worcestershire, parmesan, ail.',
      'Déchirer la laitue en morceaux, mélanger avec sauce César.',
      'Dresser avec le poulet, croûtons et copeaux de parmesan.',
    ],
    status: 'published' as const,
  },
  {
    authorIndex: 3,
    title: 'Fondant au chocolat cœur coulant',
    description: 'L\'irrésistible dessert au cœur fondant qui séduit tout le monde. Prêt en 20 minutes !',
    category: 'Dessert',
    difficulty: 'Moyen',
    prepTime: 10,
    cookTime: 12,
    servings: 4,
    emoji: '🍫',
    bgColor: '#FED7AA',
    rating: 4.9,
    ratingsCount: 112,
    tags: ['chocolat', 'dessert', 'gourmand'],
    ingredients: [
      { quantity: '200', unit: 'g', name: 'chocolat noir 70%' },
      { quantity: '100', unit: 'g', name: 'beurre' },
      { quantity: '4', unit: 'unités', name: 'oeufs' },
      { quantity: '100', unit: 'g', name: 'sucre' },
      { quantity: '50', unit: 'g', name: 'farine' },
    ],
    instructions: [
      'Préchauffer le four à 200°C. Beurrer et fariner 4 ramequins.',
      'Faire fondre chocolat et beurre au bain-marie.',
      'Fouetter oeufs et sucre jusqu\'à blanchiment.',
      'Incorporer le chocolat fondu au mélange oeufs-sucre.',
      'Ajouter farine et sel, mélanger rapidement.',
      'Verser dans les ramequins et enfourner 11-12 minutes.',
      'Démouler immédiatement, servir avec glace vanille.',
    ],
    status: 'published' as const,
  },
];

// ─── FONCTION PRINCIPALE ──────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Démarrage du seed...\n');

  await AppDataSource.initialize();
  console.log('✅ Connecté à PostgreSQL\n');

  const userRepo = AppDataSource.getRepository(User);
  const recipeRepo = AppDataSource.getRepository(Recipe);

  // ── 1. Créer les utilisateurs ──────────────────────────────────────────────

  const createdUsers: User[] = [];

  for (const userData of DEMO_USERS) {
    // Vérifier si l'utilisateur existe déjà (idempotence)
    const existing = await userRepo.findOne({ where: { email: userData.email } });

    if (existing) {
      console.log(`⏭️  Utilisateur "${userData.username}" déjà présent`);
      createdUsers.push(existing);
      continue;
    }

    // Hasher le mot de passe manuellement (le hook @BeforeInsert ne se
    // déclenche pas avec save() sur un objet créé directement)
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = userRepo.create({
      fullName: userData.fullName,
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      bio: userData.bio,
    });

    // On bypasse le hook @BeforeInsert pour éviter un double hachage
    // en utilisant save() après avoir déjà haché manuellement
    // Le hook vérifie si ça commence par "$2b$" (hash bcrypt), donc OK
    const saved = await userRepo.save(user);
    createdUsers.push(saved);
    console.log(`✅ Utilisateur créé : ${userData.username}`);
  }

  console.log('');

  // ── 2. Créer les recettes ──────────────────────────────────────────────────

  for (const recipeData of DEMO_RECIPES) {
    const author = createdUsers[recipeData.authorIndex];

    // Vérifier si la recette existe déjà
    const existing = await recipeRepo.findOne({
      where: { title: recipeData.title, authorId: author.id },
    });

    if (existing) {
      console.log(`⏭️  Recette "${recipeData.title}" déjà présente`);
      continue;
    }

    const recipe = recipeRepo.create({
      title: recipeData.title,
      description: recipeData.description,
      category: recipeData.category,
      difficulty: recipeData.difficulty,
      prepTime: recipeData.prepTime,
      cookTime: recipeData.cookTime,
      servings: recipeData.servings,
      emoji: recipeData.emoji,
      bgColor: recipeData.bgColor,
      tags: recipeData.tags,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      status: recipeData.status,
      rating: recipeData.rating,
      ratingsCount: recipeData.ratingsCount,
      authorId: author.id,
    });

    await recipeRepo.save(recipe);
    console.log(`✅ Recette créée : ${recipeData.title}`);
  }

  console.log('\n🎉 Seed terminé avec succès !');
  console.log('📧 Compte démo : amelie@example.com / demo1234\n');

  await AppDataSource.destroy();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Erreur lors du seed :', err);
  process.exit(1);
});
