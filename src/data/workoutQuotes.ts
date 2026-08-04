/**
 * Motivational Workout Quotes
 * Rotates daily to provide inspiration during difficult workouts
 */

export interface WorkoutQuote {
  quote: string;
  author: string;
  category: "strength" | "discipline" | "perseverance" | "mindset";
}

export const WORKOUT_QUOTES: WorkoutQuote[] = [
  {
    quote: "The only bad workout is the one that didn't happen.",
    author: "Unknown",
    category: "discipline"
  },
  {
    quote: "Your body can stand almost anything. It's your mind that you have to convince.",
    author: "Unknown",
    category: "mindset"
  },
  {
    quote: "The hard days are the best because that's when champions are made.",
    author: "Unknown",
    category: "perseverance"
  },
  {
    quote: "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.",
    author: "Unknown",
    category: "strength"
  },
  {
    quote: "Don't limit your challenges. Challenge your limits.",
    author: "Unknown",
    category: "mindset"
  },
  {
    quote: "The pain you feel today will be the strength you feel tomorrow.",
    author: "Unknown",
    category: "perseverance"
  },
  {
    quote: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
    category: "discipline"
  },
  {
    quote: "The only way to define your limits is by going beyond them.",
    author: "Unknown",
    category: "strength"
  },
  {
    quote: "Every champion was once a contender who refused to give up.",
    author: "Unknown",
    category: "perseverance"
  },
  {
    quote: "Discipline is choosing between what you want now and what you want most.",
    author: "Unknown",
    category: "discipline"
  },
  {
    quote: "The last three or four reps is what makes the muscle grow.",
    author: "Arnold Schwarzenegger",
    category: "strength"
  },
  {
    quote: "When you feel like quitting, think about why you started.",
    author: "Unknown",
    category: "mindset"
  },
  {
    quote: "Sweat is just fat crying.",
    author: "Unknown",
    category: "strength"
  },
  {
    quote: "The clock is ticking. Are you becoming the person you want to be?",
    author: "Greg Plitt",
    category: "mindset"
  },
  {
    quote: "If it doesn't challenge you, it doesn't change you.",
    author: "Unknown",
    category: "perseverance"
  },
  {
    quote: "Your health is an investment, not an expense.",
    author: "Unknown",
    category: "discipline"
  },
  {
    quote: "The successful warrior is the average man, with laser-like focus.",
    author: "Bruce Lee",
    category: "mindset"
  },
  {
    quote: "Motivation is what gets you started. Habit is what keeps you going.",
    author: "Jim Ryun",
    category: "discipline"
  },
  {
    quote: "No one has ever drowned in sweat.",
    author: "Unknown",
    category: "strength"
  },
  {
    quote: "The only place where success comes before work is in the dictionary.",
    author: "Vidal Sassoon",
    category: "discipline"
  },
  {
    quote: "Be stronger than your excuses.",
    author: "Unknown",
    category: "perseverance"
  },
  {
    quote: "A one-hour workout is 4% of your day. No excuses.",
    author: "Unknown",
    category: "discipline"
  },
  {
    quote: "The body achieves what the mind believes.",
    author: "Unknown",
    category: "mindset"
  },
  {
    quote: "Pain is temporary. Quitting lasts forever.",
    author: "Lance Armstrong",
    category: "perseverance"
  },
  {
    quote: "Strong people are harder to kill than weak people and more useful in general.",
    author: "Mark Rippetoe",
    category: "strength"
  },
  {
    quote: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
    category: "mindset"
  },
  {
    quote: "The difference between try and triumph is a little umph.",
    author: "Unknown",
    category: "perseverance"
  },
  {
    quote: "Consistency is key. Even on days you don't feel like it.",
    author: "Unknown",
    category: "discipline"
  },
  {
    quote: "Train insane or remain the same.",
    author: "Unknown",
    category: "strength"
  },
  {
    quote: "Your future self will thank you for the work you put in today.",
    author: "Unknown",
    category: "mindset"
  },
  {
    quote: "Every rep counts. Every set matters. Every workout builds the person you're becoming.",
    author: "Unknown",
    category: "discipline"
  }
];

/**
 * Get a motivational quote based on the current day
 * Rotates through all quotes over the course of a month
 */
export function getDailyWorkoutQuote(): WorkoutQuote {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const quoteIndex = dayOfYear % WORKOUT_QUOTES.length;
  return WORKOUT_QUOTES[quoteIndex];
}

/**
 * Get a random motivational quote from a specific category
 */
export function getRandomWorkoutQuote(category?: WorkoutQuote["category"]): WorkoutQuote {
  const filtered = category 
    ? WORKOUT_QUOTES.filter(q => q.category === category)
    : WORKOUT_QUOTES;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}
