import { db } from "@/db/dexie";
import { syncService } from "@/services/syncService";
import { logActivity } from "@/services/xpService";
import { today } from "@/utils/date";
import type { Book } from "@/types/modules";

export const LibraryRepository = {
  async addBook(book: Omit<Book, "id">): Promise<void> {
    await db.books.add(book);
    await logActivity("book_added");
    syncService.queueSync('book', book, 'create');
  },

  /** Records a reading session and advances the book's current page. */
  async logReading(bookId: number, pagesRead: number, minutes?: number, date = today()): Promise<void> {
    const book = await db.books.get(bookId);
    if (!book) return;

    await db.readingSessions.add({ bookId, date, pagesRead, minutes });
    const nextPage = Math.min(book.totalPages, book.currentPage + pagesRead);
    await db.books.update(bookId, { currentPage: nextPage });
    await logActivity("reading_session", { date });

    syncService.queueSync('reading_session', { bookId, date, pagesRead, minutes }, 'create');
    syncService.queueSync('book', { id: bookId, currentPage: nextPage });

    if (nextPage >= book.totalPages && book.status !== "finished") {
      await LibraryRepository.finishBook(bookId, date);
    }
  },

  async finishBook(bookId: number, date = today(), rating?: number): Promise<void> {
    const book = await db.books.get(bookId);
    if (!book) return;
    await db.books.update(bookId, {
      status: "finished",
      finishedAt: date,
      currentPage: book.totalPages,
      rating: rating ?? book.rating,
    });
    await logActivity("book_finished", { date, difficulty: "hard" as const });
    syncService.queueSync('book', { id: bookId, status: 'finished', finishedAt: date, rating });
  },

  async rateBook(bookId: number, rating: number): Promise<void> {
    await db.books.update(bookId, { rating });
    syncService.queueSync('book', { id: bookId, rating });
  },

  /** A waiting-room sequel has been released: move it into the reading list. */
  async startWaitingBook(bookId: number): Promise<void> {
    await db.books.update(bookId, { status: "reading", startedAt: today() });
    syncService.queueSync('book', { id: bookId, status: 'reading', startedAt: today() });
  },

  async remove(bookId: number): Promise<void> {
    await db.readingSessions.where("bookId").equals(bookId).delete();
    await db.books.delete(bookId);
    syncService.queueSync('delete_book', bookId);
  },
};
