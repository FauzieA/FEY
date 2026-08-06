import { db } from "@/db/dexie";
import { syncService } from "@/services/syncService";
import { logActivity } from "@/services/xpService";
import { today } from "@/utils/date";
import { generateUUID } from "@/utils/uuid";
import type { Book, ReadingSession } from "@/types/modules";

export const LibraryRepository = {
  async addBook(book: Omit<Book, "id" | "createdAt" | "updatedAt" | "syncStatus">): Promise<void> {
    const record: Book = {
      id: generateUUID(),
      ...book,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    await db.books.add(record);
    await logActivity("book_added");
    syncService.queueSync('book', record, 'create');
  },

  /** Records a reading session and advances the book's current page. */
  async logReading(bookId: string, pagesRead: number, minutes?: number, date = today()): Promise<void> {
    const book = await db.books.get(bookId);
    if (!book) return;

    const session: ReadingSession = {
      id: generateUUID(),
      bookId,
      date,
      pagesRead,
      minutes,
      createdAt: today(),
      updatedAt: today(),
      syncStatus: 'pending',
    };

    await db.readingSessions.add(session);
    const nextPage = Math.min(book.totalPages, book.currentPage + pagesRead);
    await db.books.update(bookId, { currentPage: nextPage, updatedAt: today(), syncStatus: 'pending' });
    await logActivity("reading_session", { date });

    syncService.queueSync('reading_session', session, 'create');
    syncService.queueSync('book', { id: bookId, currentPage: nextPage });

    if (nextPage >= book.totalPages && book.status !== "finished") {
      await LibraryRepository.finishBook(bookId, date);
    }
  },

  async finishBook(bookId: string, date = today(), rating?: number): Promise<void> {
    const book = await db.books.get(bookId);
    if (!book) return;
    await db.books.update(bookId, {
      status: "finished",
      finishedAt: date,
      currentPage: book.totalPages,
      rating: rating ?? book.rating,
      updatedAt: today(),
      syncStatus: 'pending',
    });
    await logActivity("book_finished", { date, difficulty: "hard" as const });
    syncService.queueSync('book', { id: bookId, status: 'finished', finishedAt: date, rating });
  },

  async rateBook(bookId: string, rating: number): Promise<void> {
    await db.books.update(bookId, { rating, updatedAt: today(), syncStatus: 'pending' });
    syncService.queueSync('book', { id: bookId, rating });
  },

  /** A waiting-room sequel has been released: move it into the reading list. */
  async startWaitingBook(bookId: string): Promise<void> {
    await db.books.update(bookId, { status: "reading", startedAt: today(), updatedAt: today(), syncStatus: 'pending' });
    syncService.queueSync('book', { id: bookId, status: 'reading', startedAt: today() });
  },

  async remove(bookId: string): Promise<void> {
    await db.readingSessions.where("bookId").equals(bookId).delete();
    await db.books.delete(bookId);
    syncService.queueSync('delete_book', bookId);
  },
};
