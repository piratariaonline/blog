import { SITE } from '@/consts'
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getAllPostsAndSubposts, isSubpost, getParentId } from '@/lib/data-utils'

export async function GET(context: APIContext) {
  try {
	    const posts = await getAllPostsAndSubposts()
	    const postsById = new Map(posts.map((post) => [post.id, post]))

	    return rss({
	      title: SITE.title,
	      description: SITE.description,
	      site: context.site ?? SITE.href,
	      items: posts.map((post) => {
	        if (!isSubpost(post.id)) {
	          // Carta: scroll emoji + title, no brackets
	          return {
	            title: `📜 ${post.data.title}`,
	            description: post.data.description,
	            pubDate: post.data.date,
	            link: `/${post.id}/`,
	          }
	        }

	        // Notinha: [📜 ParentCartaTitle] 📝 NotinhaTitle
	        const parentId = getParentId(post.id)
	        const parentTitle = postsById.get(parentId)?.data.title ?? parentId

	        return {
	          title: `[📜 ${parentTitle}] 📝 ${post.data.title}`,
	          description: post.data.description,
	          pubDate: post.data.date,
	          link: `/${post.id}/`,
	        }
	      }),
	    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Error generating RSS feed', { status: 500 })
  }
}
