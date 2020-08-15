declare namespace Goodreads {
  interface Book {
    id: number;
    title: string;
  }

  interface UserStatus {
    percent: number;
    updated_at: string;
  }

  interface Review {
    id: number;
    book: Book;
    user_statuses?: { user_status: UserStatus | UserStatus[] };
    date_updated: string;
  }

  interface ReviewList {
    GoodreadsResponse: {
      reviews: {
        review: Review[];
      };
    };
  }

  interface ReviewShow {
    GoodreadsResponse: {
      review: Review;
    };
  }
}

interface Book {
  id: number;
  title: string;
  percent: number;
  date: Date;
}
