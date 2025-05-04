const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum,blog) => {
        return sum + blog.likes
    }, 0)
}

const favoriteBlog = (blogs) => {
    if(blogs.length === 0) {
        return null
    } 
    else {
        return blogs.reduce((prev, current) => {
            return (prev.likes > current.likes) ? prev : current
        })
    }
}

const mostBlogs = (blogs) => {
    if(blogs.length === 0) {
        return null
    }   
    const authorBlogs = blogs.reduce((acc, blog) => {
        acc[blog.author] = (acc[blog.author] || 0) + 1
        return acc
    }, {})

    const mostBlogsAuthor = Object.keys(authorBlogs).reduce((a, b) => authorBlogs[a] > authorBlogs[b] ? a : b)

    return {
        author: mostBlogsAuthor,
        blogs: authorBlogs[mostBlogsAuthor],
    }
}

const mostLikes = (blogs) => {
    if(blogs.length === 0){
        return null
    }
    const authorLikes = blogs.reduce((acc, blog) => {
        acc[blog.author] = (acc[blog.author] || 0) + blog.likes
        return acc
    }, {})

    const mostLikedAuthor = Object.keys(authorLikes).reduce((a,b) => authorLikes[a] > authorLikes[b] ? a : b)

    return {
        author: mostLikedAuthor,
        likes: authorLikes[mostLikedAuthor]
    }
}

module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}