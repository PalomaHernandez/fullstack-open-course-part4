const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const api = supertest(app)

const { test, after, beforeEach, describe } = require('node:test')
const Blog = require('../models/blog')
const helper = require('./test_helper')

describe('when there are initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    const { user, token: authToken } = await helper.createTestUserAndToken()
    token = authToken
    const blogObjects = helper.initialBlogs.map(blog => new Blog({ ...blog, user: user._id }))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('all blogs are returned as json', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('unique property blog identifier is named id', async () => {
    const blogs = await helper.blogsInDb()
    const allHaveId = blogs.every(blog => blog.id !== undefined)

    assert.strictEqual(allHaveId, true)
  })

  describe('creating a blog', () => {
    test('a new valid blog is added correctly', async () => {
      const newBlog = {
        title: 'Blog test',
        author: 'Edsger W. Dijkstra',
        url: 'https://google.com',
        likes: 0,
        userId: '6816420edcd92746037ab994'
      }

      await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog).expect(201).expect('Content-type', /application\/json/)

      const blogs = await helper.blogsInDb()

      const titles = blogs.map(r => r.title)

      assert.strictEqual(blogs.length, helper.initialBlogs.length + 1)
      assert(titles.includes('Blog test'))
    })

    test('a new blog with no likes field gets likes set to 0', async () => {
      const newBlog = {
        title: 'Blog test',
        author: 'Edsger W. Dijkstra',
        url: 'https://google.com',
        user: '6816420edcd92746037ab994'
      }

      await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog).expect(201).expect('Content-type', /application\/json/)

      const blogs = await helper.blogsInDb()

      const savedBlog = blogs.find(r => r.title === 'Blog test')

      assert.strictEqual(blogs.length, helper.initialBlogs.length + 1)
      assert.strictEqual(savedBlog.likes, 0)
    })

    test('missing title returns 400', async () => {
      const newBlog = {
        author: 'Edsger W. Dijkstra',
        url: 'https://google.com',
        likes: 2,
        user: '6816420edcd92746037ab994'
      }

      const res = await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog).expect(400)
      assert.strictEqual(res.status, 400)

      const blogs = await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length)

    })

    test('missing url returns 400', async () => {
      const newBlog = {
        title: 'Blog test',
        author: 'Edsger W. Dijkstra',
        likes: 2,
        user: '6816420edcd92746037ab994'
      }

      const res = await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog).expect(400)
      assert.strictEqual(res.status, 400)

      const blogs = await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length)
    })
  })

  describe('deleting a blog', () => {
    test('valid deletion returns 204 and removes blog', async () => {
      const initialBlogs = await helper.blogsInDb()
      const blogToDeleteId = initialBlogs[0].id
      const res = await api.delete(`/api/blogs/${blogToDeleteId}`).set('Authorization', `Bearer ${token}`)
      assert.strictEqual(res.status, 204)

      const blogsAfter = await helper.blogsInDb()
      assert.strictEqual(blogsAfter.length, helper.initialBlogs.length - 1)

      const ids = blogsAfter.map(blog => blog.id)
      assert(!ids.includes(blogToDeleteId))

    })

    test('invalid deletion returns 404', async () => {
      const blogToDeleteId = await helper.nonExistingId()
      const res = await api.delete(`/api/blogs/${blogToDeleteId}`).set('Authorization', `Bearer ${token}`)
      assert.strictEqual(res.status, 404)

      const blogsAfter = await helper.blogsInDb()
      assert.strictEqual(blogsAfter.length, helper.initialBlogs.length)

      const ids = blogsAfter.map(blog => blog.id)
      assert(!ids.includes(blogToDeleteId))

    })
  })

  describe('updating a blog', () => {
    test('can update the number of likes', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedData = { likes: blogToUpdate.likes + 1 }

      const response = await api
        .patch(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)
    })

    test('non-existing blog returns 404', async () => {
      const blogToUpdateId = await helper.nonExistingId()

      await api
        .patch(`/api/blogs/${blogToUpdateId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ likes: 100 })
        .expect(404)
    })

    test('can update multiple fields', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedData = {
        title: 'New Title',
        author: 'New Author',
        likes: 42
      }

      const response = await api
        .patch(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
        .expect(200)

      assert.strictEqual(response.body.title, updatedData.title)
      assert.strictEqual(response.body.author, updatedData.author)
      assert.strictEqual(response.body.likes, updatedData.likes)
    })

    test('invalid data returns 400', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      await api
        .patch(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ likes: 'a lot' })
        .expect(400)
    })
  })

  describe('authorization', () => {
    test('creating a blog fails with 401 if token is not provided', async () => {
      const newBlog = {
        title: 'Unauthorized Blog',
        author: 'No Auth',
        url: 'https://unauthorized.com',
        likes: 5,
      }

      const result = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)

      assert.strictEqual(result.body.error, 'token invalid')

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('creating a blog fails with 401 if token is invalid', async () => {
      const newBlog = {
        title: 'Invalid Token Blog',
        author: 'Bad Token',
        url: 'https://badtoken.com',
        likes: 1
      }

      await api
        .post('/api/blogs')
        .set('Authorization', 'Bearer invalidtoken123')
        .send(newBlog)
        .expect(401)
    })

    test('updating a blog fails with 401 if token is invalid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedData = { likes: blogToUpdate.likes + 1 }

      await api
        .patch(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', 'Bearer invalidtoken123')
        .send(updatedData)
        .expect(401)

    })

    test('deleting a blog fails with 403 if user is not the owner', async () => {
      const { user: ownerUser, token: ownerToken } = await helper.createTestUserAndToken()
      const blog = new Blog({
        title: 'Protected blog',
        author: 'Owner',
        url: 'https://owner.com',
        user: ownerUser._id
      })
      await blog.save()

      const { token: otherToken } = await helper.createTestUserAndToken()

      await api
        .delete(`/api/blogs/${blog._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)

      const blogsAtEnd = await helper.blogsInDb()
      assert(blogsAtEnd.map(b => b.id).includes(blog.id))
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})