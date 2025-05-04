const config = require('../utils/config')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const initialBlogs = [
    {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      userId: '6816420edcd92746037ab994'
    },
    {
      title: 'Test Blog 2',
      author: 'John Doe',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      userId: '6816420edcd92746037ab994'
    },
  ]

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'This will be removed',
    author: 'Test',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 5,
   })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const createTestUserAndToken = async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('testpassword', 10)
  const user = new User({ username: 'testname', passwordHash})
  const savedUser = await user.save()

  const userForToken = {
    username: savedUser.username,
    id: savedUser._id
  }

  const token = jwt.sign(userForToken, config.SECRET)

  return{ user: savedUser, token }
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb, usersInDb, createTestUserAndToken
}