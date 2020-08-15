import got from 'got';
import xml from 'fast-xml-parser';
import dotenv from 'dotenv';
import { Octokit } from '@octokit/rest';

dotenv.config();

const octokit = new Octokit({ auth: process.env.GH_TOKEN });

const request = got.extend({
  prefixUrl: 'https://www.goodreads.com',
  searchParams: {
    v: 2,
    key: process.env.GOODREADS_API_KEY,
  },
});

export async function getReviewList(
  shelf = 'currently-reading'
): Promise<Goodreads.Review[]> {
  const res = await request
    .get('review/list', {
      searchParams: {
        id: process.env.GOODREADS_USER_ID,
        shelf,
      },
    })
    .text();
  const reviewList: Goodreads.ReviewList = xml.parse(res);
  const reviews = reviewList.GoodreadsResponse.reviews.review;
  return reviews;
}

export async function getReviewShow(id: number): Promise<Goodreads.Review> {
  const res = await request.get('review/show', { searchParams: { id } }).text();
  const reviewShow: Goodreads.ReviewShow = xml.parse(res);
  const review = reviewShow.GoodreadsResponse.review;
  return review;
}

export async function updateGist(
  title: string,
  content: string
): Promise<void> {
  const gist_id = process.env.GIST_ID || '';
  const gist = await octokit.gists.get({ gist_id });
  const filename = Object.keys(gist.data.files)[0];
  await octokit.gists.update({
    gist_id,
    files: {
      [filename]: {
        filename: title,
        content,
      },
    },
  });
}
