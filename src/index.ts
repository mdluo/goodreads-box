import dotenv from 'dotenv';
import he from 'he';

import * as api from './api';
import { generateBarChart } from './bar';

dotenv.config();

const MAX_LENGTH = 54;
const MAX_LINES = 5;

async function getBooks(): Promise<Book[]> {
  const reviewList = await api.getReviewList();
  const reviews = await Promise.all(
    reviewList.map(({ id }) => api.getReviewShow(id))
  );
  const books = reviews
    .map(({ id, book, date_updated, user_statuses }) => {
      const latestStatus = Array.isArray(user_statuses?.user_status)
        ? user_statuses?.user_status[0]
        : user_statuses?.user_status;
      return {
        id: id,
        title: he.decode(book.title),
        percent: latestStatus?.percent || 0,
        date: new Date(latestStatus?.updated_at || date_updated),
      };
    })
    .sort((a, b) => {
      if (process.env.BOOKS_SORT_BY === 'percent') {
        return b.percent - a.percent;
      }
      return b.date.getTime() - a.date.getTime();
    });
  return books;
}

function generateLines(books: Book[]) {
  const barWidth = Math.floor(MAX_LENGTH / 4);
  const lines = books.slice(0, MAX_LINES).map(({ title, percent }) => {
    const bar = generateBarChart(percent, barWidth);
    const percentage = `${percent}%`.padStart(4, ' ');
    const length = MAX_LENGTH - bar.length - percentage.length - 1;
    let text = title;
    if (title.length > length) {
      text = title.substring(0, length - 3).concat('...');
    } else {
      text = title.padEnd(length, ' ');
    }
    return `${text} ${bar}${percentage}`;
  });
  return lines;
}

(async () => {
  try {
    const books = await getBooks();
    const lines = generateLines(books);
    await api.updateGist(
      `📚 Currently reading books (${lines.length}／${books.length})`,
      lines.join('\n')
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
