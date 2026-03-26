const WP_GRAPHQL_URL = import.meta.env.VITE_WP_GRAPHQL_URL || 'http://localhost:8080/graphql';

async function fetchGraphQL(query: string, variables: Record<string, any> = {}) {
  const res = await fetch(WP_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await res.json();
  if (json.errors) {
    console.error(json.errors);
    throw new Error('Failed to fetch API');
  }
  return json.data;
}

export const wpService = {
  async getPosts() {
    const data = await fetchGraphQL(`
      query AllPosts {
        posts(first: 10, where: { orderby: { field: DATE, order: DESC } }) {
          nodes {
            id
            title
            slug
            date
            excerpt
            featuredImage {
              node {
                sourceUrl
              }
            }
          }
        }
      }
    `);
    return data.posts.nodes;
  },

  async getPostBySlug(slug: string) {
    const data = await fetchGraphQL(`
      query PostBySlug($id: ID!, $idType: PostIdType!) {
        post(id: $id, idType: $idType) {
          id
          title
          slug
          date
          content
          featuredImage {
            node {
              sourceUrl
            }
          }
          author {
            node {
              name
            }
          }
        }
      }
    `, { id: slug, idType: 'SLUG' });
    return data.post;
  }
};
