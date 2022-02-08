import { useRouter } from 'next/router';
import { Link } from 'nuudel-core';
import { withApollo } from 'nuudel-core';
import { fetcher } from '../../../lib/fetcher';
import useSWR from 'swr';

// This function gets called at build time

export async function getStaticPaths() {
  return {
    paths: [],
    // Enable statically generating additional pages
    fallback: true,
  };
}

// This also gets called at build time
export async function getStaticProps({ params }) {
  // Pass post data to the page via props
  return {
    props: { post: {} },
    // Re-generate the post at most once per second
    // if a request comes in
    //revalidate: 1,
  };
}

const Post = () => {
  const router = useRouter();
  const { id } = router.query;

  // params contains the post `id`.
  // If the route is like /posts/1, then params.id is 1
  const { data, error } = useSWR<any, any>(
    `query GetPostBy {
      getPostBy(slug: "${id}") {
      _id
      createdAt
      updatedAt
      title
      date
      description
      content
    }
  }`,
    fetcher,
  );

  return (
    <>
      <h1>{!data ? 'Post:' : data.getPostBy.title}</h1>
      <ul>
        <li>
          <Link href="/post/[id]/[comment]" as={`/post/${id}/first-comment`}>
            <span>First comment</span>
          </Link>
        </li>
      </ul>
    </>
  );
};

export default withApollo(Post);
