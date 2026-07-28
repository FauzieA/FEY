import { db } from "@/db/dexie";
import { logActivity } from "@/services/xpService";
import { today } from "@/utils/date";
import type { Book } from "@/types/modules";

export const LibraryRepository = {
  async addBook(book: Omit<Book, "id">): Promise<void> {
    await db.books.add(book);
    await logActivity("book_added");
  },

  /** Records a reading session and advances the book's current page. */
  async logReading(bookId: number, pagesRead: number, minutes?: number, date = today()): Promise<void> {
    const book = await db.books.get(bookId);
    if (!book) return;

    await db.readingSessions.add({ bookId, date, pagesRead, minutes });
    const nextPage = Math.min(book.totalPages, book.currentPage + pagesRead);
    await db.books.update(bookId, { currentPage: nextPage });
    await logActivity("reading_session", { date });

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
    await logActivity("book_finished", { date });
  },

  async rateBook(bookId: number, rating: number): Promise<void> {
    await db.books.update(bookId, { rating });
  },

  /** A waiting-room sequel has been released: move it into the reading list. */
  async startWaitingBook(bookId: number): Promise<void> {
    await db.books.update(bookId, { status: "reading", startedAt: today() });
  },

  async remove(bookId: number): Promise<void> {
    await db.readingSessions.where("bookId").equals(bookId).delete();
    await db.books.delete(bookId);
  },
};
