import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { QuestionCategory } from '../generated/prisma/enums.ts';

const adapter = new PrismaLibSql({
  url: 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

const questions = [
  // Столицы
  { text: 'Где находится Париж?', correctLat: 48.8566, correctLng: 2.3522, category: QuestionCategory.CAPITAL, hint: 'Столица Франции' },
  { text: 'Где находится Лондон?', correctLat: 51.5074, correctLng: -0.1278, category: QuestionCategory.CAPITAL, hint: 'Столица Великобритании' },
  { text: 'Где находится Токио?', correctLat: 35.6762, correctLng: 139.6503, category: QuestionCategory.CAPITAL, hint: 'Столица Японии' },
  { text: 'Где находится Москва?', correctLat: 55.7558, correctLng: 37.6173, category: QuestionCategory.CAPITAL, hint: 'Столица России' },
  { text: 'Где находится Рим?', correctLat: 41.9028, correctLng: 12.4964, category: QuestionCategory.CAPITAL, hint: 'Столица Италии' },
  { text: 'Где находится Берлин?', correctLat: 52.5200, correctLng: 13.4050, category: QuestionCategory.CAPITAL, hint: 'Столица Германии' },
  { text: 'Где находится Мадрид?', correctLat: 40.4168, correctLng: -3.7038, category: QuestionCategory.CAPITAL, hint: 'Столица Испании' },
  { text: 'Где находится Пекин?', correctLat: 39.9042, correctLng: 116.4074, category: QuestionCategory.CAPITAL, hint: 'Столица Китая' },
  { text: 'Где находится Каир?', correctLat: 30.0444, correctLng: 31.2357, category: QuestionCategory.CAPITAL, hint: 'Столица Египта' },
  { text: 'Где находится Канберра?', correctLat: -35.2809, correctLng: 149.1300, category: QuestionCategory.CAPITAL, hint: 'Столица Австралии' },

  // Достопримечательности
  { text: 'Где находится Эйфелева башня?', correctLat: 48.8584, correctLng: 2.2945, category: QuestionCategory.LANDMARK, hint: 'Находится в Париже' },
  { text: 'Где находится Статуя Свободы?', correctLat: 40.6892, correctLng: -74.0445, category: QuestionCategory.LANDMARK, hint: 'Находится в Нью-Йорке' },
  { text: 'Где находится Тадж-Махал?', correctLat: 27.1751, correctLng: 78.0421, category: QuestionCategory.LANDMARK, hint: 'Находится в Индии' },
  { text: 'Где находится Колизей?', correctLat: 41.8902, correctLng: 12.4922, category: QuestionCategory.LANDMARK, hint: 'Находится в Риме' },
  { text: 'Где находится Сиднейский оперный театр?', correctLat: -33.8568, correctLng: 151.2153, category: QuestionCategory.LANDMARK, hint: 'Находится в Австралии' },
  { text: 'Где находится Великая Китайская стена (Бадалин)?', correctLat: 40.3539, correctLng: 116.0204, category: QuestionCategory.LANDMARK, hint: 'Находится недалеко от Пекина' },
  { text: 'Где находится Мачу-Пикчу?', correctLat: -13.1631, correctLng: -72.5450, category: QuestionCategory.LANDMARK, hint: 'Находится в Перу' },
  { text: 'Где находится Стоунхендж?', correctLat: 51.1789, correctLng: -1.8262, category: QuestionCategory.LANDMARK, hint: 'Находится в Англии' },

  // Города
  { text: 'Где находится Нью-Йорк?', correctLat: 40.7128, correctLng: -74.0060, category: QuestionCategory.CITY, hint: 'Крупнейший город США' },
  { text: 'Где находится Дубай?', correctLat: 25.2048, correctLng: 55.2708, category: QuestionCategory.CITY, hint: 'Находится в ОАЭ' },
  { text: 'Где находится Сингапур?', correctLat: 1.3521, correctLng: 103.8198, category: QuestionCategory.CITY, hint: 'Город-государство в Азии' },
  { text: 'Где находится Рио-де-Жанейро?', correctLat: -22.9068, correctLng: -43.1729, category: QuestionCategory.CITY, hint: 'Находится в Бразилии' },
  { text: 'Где находится Барселона?', correctLat: 41.3851, correctLng: 2.1734, category: QuestionCategory.CITY, hint: 'Находится в Испании' },
  { text: 'Где находится Венеция?', correctLat: 45.4408, correctLng: 12.3155, category: QuestionCategory.CITY, hint: 'Город на воде в Италии' },
  { text: 'Где находится Амстердам?', correctLat: 52.3676, correctLng: 4.9041, category: QuestionCategory.CITY, hint: 'Находится в Нидерландах' },
  { text: 'Где находится Сан-Франциско?', correctLat: 37.7749, correctLng: -122.4194, category: QuestionCategory.CITY, hint: 'Находится в Калифорнии' },

  // Страны (центральные точки)
  { text: 'Где находится Франция?', correctLat: 46.2276, correctLng: 2.2137, category: QuestionCategory.COUNTRY, hint: 'Страна в Западной Европе' },
  { text: 'Где находится Италия?', correctLat: 41.8719, correctLng: 12.5674, category: QuestionCategory.COUNTRY, hint: 'Страна в форме сапога' },
  { text: 'Где находится Япония?', correctLat: 36.2048, correctLng: 138.2529, category: QuestionCategory.COUNTRY, hint: 'Островное государство в Азии' },
  { text: 'Где находится Бразилия?', correctLat: -14.2350, correctLng: -51.9253, category: QuestionCategory.COUNTRY, hint: 'Крупнейшая страна Южной Америки' },
  { text: 'Где находится Канада?', correctLat: 56.1304, correctLng: -106.3468, category: QuestionCategory.COUNTRY, hint: 'Вторая по площади страна мира' },
  { text: 'Где находится Индия?', correctLat: 20.5937, correctLng: 78.9629, category: QuestionCategory.COUNTRY, hint: 'Крупнейшая по населению страна Азии' },
  { text: 'Где находится Египет?', correctLat: 26.8206, correctLng: 30.8025, category: QuestionCategory.COUNTRY, hint: 'Страна на севере Африки' },
  { text: 'Где находится Австралия?', correctLat: -25.2744, correctLng: 133.7751, category: QuestionCategory.COUNTRY, hint: 'Континент в Южном полушарии' },
];

async function main() {
  console.log('Seeding database...');

  for (const q of questions) {
    await prisma.question.create({
      data: {
        text: q.text,
        correctLat: q.correctLat,
        correctLng: q.correctLng,
        category: q.category,
        hint: q.hint,
        difficulty: 1,
      },
    });
  }

  console.log(`Created ${questions.length} questions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
