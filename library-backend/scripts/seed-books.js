import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../src/models/Book.model.js';
import connectDB from '../src/config/db.js';

dotenv.config();

const FAMOUS_BOOKS = [
  {
    title: 'The Pragmatic Programmer',
    author: 'David Thomas, Andrew Hunt',
    isbn: '9780135957059',
    category: 'Technology',
    description: 'One of the most significant books in software development. Offers practical advice on everything from personal responsibility and career development to architectural techniques for keeping code flexible and easy to adapt. A must-read for developers who want to become more effective.',
    quantity: 5,
    rentPerDay: 18,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg',
    publishedYear: 2019,
    publisher: 'Addison-Wesley',
    isBestseller: true,
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    category: 'Technology',
    description: 'A handbook of agile software craftsmanship. Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. This book describes the principles, patterns, and practices of writing clean code.',
    quantity: 6,
    rentPerDay: 16,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
    publishedYear: 2008,
    publisher: 'Prentice Hall',
    isBestseller: true,
  },
  {
    title: 'Design Patterns',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    isbn: '9780201633610',
    category: 'Technology',
    description: 'The seminal "Gang of Four" book that introduced 23 classic software design patterns. Captures solutions that have been developed and evolved over time. Essential reading for object-oriented designers and programmers.',
    quantity: 4,
    rentPerDay: 20,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg',
    publishedYear: 1994,
    publisher: 'Addison-Wesley',
    isBestseller: true,
  },
  {
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935',
    category: 'Fiction',
    description: 'A dystopian social science fiction novel. Winston Smith lives in a totalitarian regime where the Party controls everything, including history and language. A powerful exploration of surveillance, propaganda, and totalitarianism that remains strikingly relevant.',
    quantity: 8,
    rentPerDay: 12,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
    publishedYear: 1949,
    publisher: 'Secker & Warburg',
    isBestseller: true,
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '9780061120084',
    category: 'Fiction',
    description: 'A novel about racial injustice and moral growth in the American South. Through the eyes of Scout Finch, we witness her father Atticus defend a Black man falsely accused of rape. A timeless story of compassion, integrity, and the fight against prejudice.',
    quantity: 7,
    rentPerDay: 14,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg',
    publishedYear: 1960,
    publisher: 'J.B. Lippincott & Co.',
    isBestseller: true,
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    category: 'Fiction',
    description: 'A story of decadence, excess, and the American Dream in the Jazz Age. Jay Gatsby throws lavish parties in hopes of winning back his lost love, Daisy Buchanan. Fitzgerald\'s masterpiece explores illusion, wealth, and the emptiness of materialism.',
    quantity: 6,
    rentPerDay: 13,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
    publishedYear: 1925,
    publisher: 'Charles Scribner\'s Sons',
    isBestseller: true,
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '9780141439518',
    category: 'Fiction',
    description: 'The timeless romance between Elizabeth Bennet and the proud Mr. Darcy. Austen\'s wit and social commentary shine as she explores manners, marriage, and morality in Regency England. One of the most beloved novels in the English language.',
    quantity: 5,
    rentPerDay: 12,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
    publishedYear: 1813,
    publisher: 'T. Egerton',
    isBestseller: true,
  },
  {
    title: 'Harry Potter and the Philosopher\'s Stone',
    author: 'J.K. Rowling',
    isbn: '9780747532699',
    category: 'Fiction',
    description: 'The book that started a global phenomenon. Harry discovers he is a wizard on his eleventh birthday and is invited to Hogwarts School of Witchcraft and Wizardry. A tale of friendship, bravery, and the battle between good and evil.',
    quantity: 10,
    rentPerDay: 15,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780747532699-L.jpg',
    publishedYear: 1997,
    publisher: 'Bloomsbury',
    isBestseller: true,
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    isbn: '9780547928227',
    category: 'Fiction',
    description: 'The prelude to The Lord of the Rings. Bilbo Baggins, a comfort-loving hobbit, is swept into an adventure with dwarves and a wizard. A classic fantasy about courage, friendship, and the discovery of unexpected heroism.',
    quantity: 6,
    rentPerDay: 14,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg',
    publishedYear: 1937,
    publisher: 'George Allen & Unwin',
    isBestseller: true,
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    isbn: '9780062315007',
    category: 'Fiction',
    description: 'A fable about following your dreams. Santiago, an Andalusian shepherd, journeys to the pyramids of Egypt in search of treasure. Along the way he learns to listen to his heart and recognize the omens that guide us toward our destiny.',
    quantity: 8,
    rentPerDay: 11,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg',
    publishedYear: 1988,
    publisher: 'HarperCollins',
    isBestseller: true,
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    isbn: '9780062316097',
    category: 'History',
    description: 'A brief history of humankind from the Stone Age to the twenty-first century. Harari explores how Homo sapiens came to dominate the world, and how we created cities, kingdoms, and cultures. Thought-provoking and accessible.',
    quantity: 5,
    rentPerDay: 17,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
    publishedYear: 2014,
    publisher: 'Harper',
    isBestseller: true,
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn: '9780735211292',
    category: 'Self-Help',
    description: 'A guide to building good habits and breaking bad ones. Clear reveals practical strategies grounded in science for making small changes that compound into remarkable results. Learn how to design your environment for success.',
    quantity: 7,
    rentPerDay: 15,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
    publishedYear: 2018,
    publisher: 'Avery',
    isBestseller: true,
  },
  {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    isbn: '9780307887894',
    category: 'Business',
    description: 'How today\'s entrepreneurs use continuous innovation to create radically successful businesses. Ries provides a scientific approach to creating and managing startups and getting a desired product to customers faster.',
    quantity: 4,
    rentPerDay: 19,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg',
    publishedYear: 2011,
    publisher: 'Crown Business',
    isBestseller: false,
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    isbn: '9781455586691',
    category: 'Self-Help',
    description: 'Rules for focused success in a distracted world. Newport argues that the ability to focus without distraction is becoming the superpower of the twenty-first century. Learn to cultivate deep work and produce at an elite level.',
    quantity: 5,
    rentPerDay: 16,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg',
    publishedYear: 2016,
    publisher: 'Grand Central Publishing',
    isBestseller: false,
  },
  {
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    isbn: '9780544003415',
    category: 'Fiction',
    description: 'The epic fantasy saga of Middle-earth. Frodo Baggins must destroy the One Ring before it falls into the hands of the Dark Lord Sauron. A monumental tale of fellowship, sacrifice, and the struggle against overwhelming darkness.',
    quantity: 4,
    rentPerDay: 18,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780544003415-L.jpg',
    publishedYear: 1954,
    publisher: 'George Allen & Unwin',
    isBestseller: true,
  },
];

const seedBooks = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('🗑️  Removing all existing books...');
    const deleted = await Book.deleteMany({});
    console.log(`   Deleted ${deleted.deletedCount} book(s).\n`);

    console.log('📚 Inserting famous books...');
    const toInsert = FAMOUS_BOOKS.map((b) => ({
      ...b,
      availableQuantity: b.quantity,
    }));

    const inserted = await Book.insertMany(toInsert);
    console.log(`✅ Inserted ${inserted.length} books successfully!\n`);

    console.log('📋 Seeded books:');
    inserted.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.title} — ${b.author} (₹${b.rentPerDay}/day)`);
    });

    console.log('\n🎉 Seed complete. Your Offline Library is ready.\n');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate ISBN — check for conflicting books.');
    }
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

seedBooks();
