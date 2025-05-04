const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

const blog1 = {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 5,
    __v: 0
}

const blog2 = {
    _id: '5a422aa71b54a676234d17f9',
    title: 'Test Blog',
    author: 'Edsger W. Dijkstra',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 10,
    __v: 0
}

const blog3 = {
    _id: '5a422aa71b54a676234d17f6',
    title: 'Test Blog 2',
    author: 'John Doe',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 5,
    __v: 0
}

const blog4 = {
    _id: '5a422aa71b54a676234d17f5',
    title: 'Test Blog 3',
    author: 'John Doe',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 10,
    __v: 0
}

const listWithOneBlog = [blog1]
const listWithManyBlogs = [blog1, blog2, blog3]
const listWithManyBlogs2 = [blog1, blog2, blog3, blog4] 

test('dummy returns one', () => {
    const blogs = []

    const result = listHelper.dummy(blogs)
    assert.strictEqual(result, 1)
})

describe('total likes', () => {
    test('when list has only one blog, equals the likes of that', () => {
        const result = listHelper.totalLikes(listWithOneBlog)
        assert.strictEqual(result, 5)
    })

    test('when list has many blogs, equals the likes of those', () => {
        const result = listHelper.totalLikes(listWithManyBlogs)
        assert.strictEqual(result, 20)
    })
    test('when list is empty, equals 0', () => {
        const result = listHelper.totalLikes([])
        assert.strictEqual(result, 0)
    })
})

describe('favorite blog', () => {
    test('when list has only one blog, equals the blog', () => {
        const result = listHelper.favoriteBlog(listWithOneBlog)
        assert.deepStrictEqual(result, {
            _id: '5a422aa71b54a676234d17f8',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
            likes: 5,
            __v: 0
        })
    })

    test('when list has many blogs, equals the blog with most likes', () => {
        const result = listHelper.favoriteBlog(listWithManyBlogs)
        assert.deepStrictEqual(result, {
            _id: '5a422aa71b54a676234d17f9',
            title: 'Test Blog',
            author: 'Edsger W. Dijkstra',
            url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
            likes: 10,
            __v: 0
        })
    })
    test('when list is empty, equals null', () => {
        const result = listHelper.favoriteBlog([])
        assert.strictEqual(result, null)
    })
})

describe('most blogs', () => {
    test('when list has only one blog, equals the author of that', () => {
        const result = listHelper.mostBlogs(listWithOneBlog)
        console.log(result)
        assert.deepStrictEqual(result, {
            author: "Edsger W. Dijkstra",
            blogs: 1,
        })
    })

    test('when list has many blogs, equals the author with most blogs and the amount of blogs that author has', () => {
        const result = listHelper.mostBlogs(listWithManyBlogs)
        console.log(result)
        assert.deepStrictEqual(result, {
            author: "Edsger W. Dijkstra",
            blogs: 2,
        })
    })

    test('when list has many blogs, and two authors have the same amount of blogs, equals one of the authors with most blogs', () => {
        const result = listHelper.mostBlogs(listWithManyBlogs2)
        console.log(result)
        assert.deepStrictEqual(result, {
            author: "John Doe",
            blogs: 2,
        })
    })

    test('when list is empty, equals null', () => {
        const result = listHelper.mostBlogs([])
        assert.strictEqual(result, null)
    })
})

describe('most likes', () => {
    test('when list has only one blog, equals the author and likes of that blog', () => {
        const result = listHelper.mostLikes(listWithOneBlog)
        console.log(result)
        assert.deepStrictEqual(result, {
            author: "Edsger W. Dijkstra",
            likes: 5,
        })
    })

    test('when list has many blogs, equals the author with most likes and the amount of likes that author has', () => {
        const result = listHelper.mostLikes(listWithManyBlogs)
        console.log(result)
        assert.deepStrictEqual(result, {
            author: "Edsger W. Dijkstra",
            likes: 15,
        })
    })

    test('when list has many blogs, and two authors have the same amount of likes, equals one of the authors with most likes', () => {
        const result = listHelper.mostLikes(listWithManyBlogs2)
        console.log(result)
        assert.deepStrictEqual(result, {
            author: "John Doe",
            likes: 15,
        })
    })

    test('when list is empty, equals null', () => {
        const result = listHelper.mostLikes([])
        assert.strictEqual(result, null)
    })
})